import { NextResponse } from "next/server";
import { lookup } from "dns/promises";
import { rateLimit, clientIp, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";
export const maxDuration = 20;

/** Read a response body but stop after `cap` bytes (avoids buffering huge/malicious payloads). */
async function readCapped(res: Response, cap: number): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < cap) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  try { await reader.cancel(); } catch { /* ignore */ }
  const size = Math.min(total, cap);
  const buf = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) {
    if (off >= size) break;
    const take = Math.min(c.length, size - off);
    buf.set(c.subarray(0, take), off);
    off += take;
  }
  return new TextDecoder("utf-8").decode(buf);
}

/* --- SSRF protection: never let a user-supplied URL reach internal hosts --- */
function ipIsPrivate(ip: string): boolean {
  if (/^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
    const p = ip.split(".").map(Number);
    if (p[0] === 10 || p[0] === 127 || p[0] === 0) return true;
    if (p[0] === 169 && p[1] === 254) return true;         // link-local / cloud metadata
    if (p[0] === 172 && p[1] >= 16 && p[1] <= 31) return true;
    if (p[0] === 192 && p[1] === 168) return true;
    if (p[0] === 100 && p[1] >= 64 && p[1] <= 127) return true; // CGNAT
    if (p[0] >= 224) return true;                          // multicast / reserved
    return false;
  }
  const s = ip.toLowerCase();
  if (s === "::1" || s === "::") return true;
  if (s.startsWith("fe80") || s.startsWith("fc") || s.startsWith("fd")) return true;
  const m = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return m ? ipIsPrivate(m[1]) : false;
}

async function hostIsPublic(host: string): Promise<boolean> {
  const h = host.toLowerCase();
  if (!h || h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return false;
  try {
    const addrs = await lookup(host, { all: true });
    return addrs.length > 0 && addrs.every((a) => !ipIsPrivate(a.address));
  } catch {
    return false;
  }
}

class BlockedHostError extends Error {}

/** Fetch that re-validates the host on every redirect hop (blocks redirect-based SSRF). */
async function safeFetch(startUrl: string, headers: Record<string, string>): Promise<Response> {
  let url = startUrl;
  for (let hop = 0; hop < 5; hop++) {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) throw new BlockedHostError("protocol");
    if (!(await hostIsPublic(u.hostname))) throw new BlockedHostError("host");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(url, { headers, redirect: "manual", signal: ctrl.signal });
      clearTimeout(timer);
      const loc = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && loc) { url = new URL(loc, url).href; continue; }
      return res;
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("too many redirects");
}

/**
 * Auto-scrape a vendor's public website / Google-business page into a mini-profile.
 * Runs server-side (Vercel), so it can fetch arbitrary public URLs. Pulls real
 * OpenGraph/meta/JSON-LD data, portfolio images, and contact details — no keys
 * required. Returns { ok, profile } with best-effort fields; the caller edits
 * before saving.
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

const CATEGORY_KEYWORDS: [string, string[]][] = [
  ["Photography", ["photograph", "photo", "photographer", "wedding films", "cinematograph"]],
  ["Videography", ["videograph", "cinematograph", "wedding film", "video production"]],
  ["Catering", ["cater", "catering", "menu", "chef", "culinary", "food truck"]],
  ["Florals", ["floral", "florist", "flowers", "blooms", "bouquet"]],
  ["Music", ["dj", "band", "music", "entertainment", "sound", "ceremony strings"]],
  ["Planning", ["planner", "planning", "coordinat", "event design", "day-of"]],
  ["Beauty", ["makeup", "hair", "beauty", "glam", "bridal hair", "salon", "artistry"]],
  ["Cake", ["cake", "bakery", "bakehouse", "dessert", "pastry", "sweets"]],
  ["Bar Service", ["bartend", "bar service", "cocktail", "mixolog", "mobile bar"]],
  ["Rentals", ["rental", "rentals", "lounge", "furniture", "linens", "tent", "decor"]],
];

function normalizeUrl(input: string): string | null {
  let s = (input || "").trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol)) return null;
    return u.href;
  } catch {
    return null;
  }
}

function abs(base: string, src: string): string | null {
  try {
    const u = new URL(src, base);
    if (!/^https?:$/.test(u.protocol)) return null;
    return u.href;
  } catch {
    return null;
  }
}

function metaContent(html: string, key: string): string | undefined {
  // matches <meta property/name="key" content="..."> in either attribute order
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*\\bcontent=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i"),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1].trim());
  }
  return undefined;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&#x27;/gi, "'")
    .replace(/&nbsp;/g, " ").replace(/&#8217;/g, "’").replace(/&#8211;/g, "–");
}

function inferCategory(text: string): string | undefined {
  const t = text.toLowerCase();
  for (const [cat, words] of CATEGORY_KEYWORDS) if (words.some((w) => t.includes(w))) return cat;
  return undefined;
}

function isJunkImage(u: string): boolean {
  const s = u.toLowerCase();
  if (s.startsWith("data:")) return true;
  if (/\.(gif|ico)(\?|$)/.test(s)) return true;
  return /(sprite|pixel|tracking|analytics|spacer|blank|1x1|placeholder|facebook\.com\/tr|doubleclick|gtag|badge|instagram-icon|social-|favicon)/.test(s);
}

function collectImages(html: string, base: string): string[] {
  const out = new Set<string>();
  const add = (raw?: string | null) => {
    if (!raw) return;
    const a = abs(base, raw.trim());
    if (a && !isJunkImage(a)) out.add(a);
  };
  // src / data-src
  const imgRe = /<img[^>]+(?:data-src|data-lazy-src|src)=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  let count = 0;
  while ((m = imgRe.exec(html)) && count < 60) { add(m[1]); count++; }
  // srcset — take the last (largest) candidate
  const srcsetRe = /srcset=["']([^"']+)["']/gi;
  count = 0;
  while ((m = srcsetRe.exec(html)) && count < 40) {
    const parts = m[1].split(",").map((p) => p.trim().split(/\s+/)[0]).filter(Boolean);
    add(parts[parts.length - 1]);
    count++;
  }
  return [...out];
}

function extractJsonLd(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim());
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else if (parsed && typeof parsed === "object") {
        blocks.push(parsed);
        const graph = (parsed as { "@graph"?: unknown })["@graph"];
        if (Array.isArray(graph)) blocks.push(...(graph as Record<string, unknown>[]));
      }
    } catch { /* ignore malformed JSON-LD */ }
  }
  return blocks;
}

export async function POST(req: Request) {
  if (!rateLimit(`enrich:${clientIp(req)}`, 12, 60_000)) return tooMany();

  let target: string | null = null;
  try {
    const { url } = await req.json();
    target = normalizeUrl(url);
  } catch { /* fallthrough */ }
  if (!target) return NextResponse.json({ ok: false, error: "Enter a valid website URL." }, { status: 200 });

  let html = "";
  let finalUrl = target;
  try {
    const res = await safeFetch(target, { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" });
    finalUrl = res.url || target;
    if (!res.ok) return NextResponse.json({ ok: false, error: `The site returned ${res.status}. Check the URL or try their Google page.` }, { status: 200 });
    const ct = res.headers.get("content-type") ?? "";
    if (ct && !/text\/html|xml|text\/plain/i.test(ct)) {
      return NextResponse.json({ ok: false, error: "That link isn't a web page. Paste their website or Google page URL." }, { status: 200 });
    }
    html = await readCapped(res, 900_000); // stream, stop at ~900KB
  } catch (e) {
    if (e instanceof BlockedHostError) {
      return NextResponse.json({ ok: false, error: "That address isn't allowed. Enter the vendor's public website." }, { status: 200 });
    }
    return NextResponse.json({ ok: false, error: "Couldn't reach that site (it may be down or blocking bots). Try their Google or Instagram URL." }, { status: 200 });
  }

  const origin = new URL(finalUrl).origin;
  const host = new URL(finalUrl).hostname.replace(/^www\./, "");

  // --- meta / OG ---
  const ogTitle = metaContent(html, "og:title") ?? metaContent(html, "twitter:title");
  const ogSite = metaContent(html, "og:site_name");
  const ogDesc = metaContent(html, "og:description") ?? metaContent(html, "description") ?? metaContent(html, "twitter:description");
  const ogImage = metaContent(html, "og:image:secure_url") ?? metaContent(html, "og:image") ?? metaContent(html, "twitter:image");
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  const rawTitle = decodeEntities((titleTag ?? "").trim());

  // --- favicon / logo ---
  let logo: string | undefined;
  const iconMatch = html.match(/<link[^>]+rel=["'][^"']*(?:apple-touch-icon|icon)[^"']*["'][^>]*href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*(?:apple-touch-icon|icon)[^"']*["']/i);
  if (iconMatch?.[1]) logo = abs(finalUrl, iconMatch[1]) ?? undefined;
  logo ??= `${origin}/favicon.ico`;

  // --- JSON-LD ---
  const ld = extractJsonLd(html);
  const org = ld.find((b) => {
    const t = b["@type"];
    const types = Array.isArray(t) ? t.map(String) : [String(t)];
    return types.some((x) => /Organization|LocalBusiness|Store|ProfessionalService|Photograph|Restaurant/i.test(x));
  });
  const ldName = org?.name as string | undefined;
  const ldPhone = org?.telephone as string | undefined;
  const ldEmail = org?.email as string | undefined;
  const ldImage = typeof org?.image === "string" ? (org.image as string)
    : Array.isArray(org?.image) ? String((org!.image as unknown[])[0]) : undefined;
  let location: string | undefined;
  const addr = org?.address as Record<string, unknown> | undefined;
  if (addr && typeof addr === "object") {
    const city = addr.addressLocality as string | undefined;
    const region = addr.addressRegion as string | undefined;
    location = [city, region].filter(Boolean).join(", ") || undefined;
  }
  const sameAs = (Array.isArray(org?.sameAs) ? (org!.sameAs as unknown[]).map(String) : []) as string[];

  // --- contacts from the page ---
  const mailto = html.match(/mailto:([^"'?]+)/i)?.[1];
  const emailRe = /[a-z0-9._%+-]{1,64}@[a-z0-9.-]{1,255}\.[a-z]{2,24}/gi;
  const emailCandidates = (html.match(emailRe) ?? []).filter(
    (e) => !/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(e) && !/(sentry|wixpress|example|\.wix|schema\.org)/i.test(e)
  );
  const email = decodeEntities(ldEmail || mailto || emailCandidates[0] || "").trim() || undefined;

  const tel = html.match(/tel:([+0-9().\-\s]{7,})/i)?.[1];
  const phoneText = html.replace(/<[^>]+>/g, " ").match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/)?.[0];
  const phone = (ldPhone || tel || phoneText || "").trim() || undefined;

  // --- instagram ---
  const igFromSame = sameAs.find((s) => /instagram\.com/i.test(s));
  const igMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._]+/i)?.[0];
  const instagram = igFromSame || igMatch || undefined;

  // --- gallery ---
  const hero = ogImage ? abs(finalUrl, ogImage) ?? undefined : (ldImage ? abs(finalUrl, ldImage) ?? undefined : undefined);
  const pageImages = collectImages(html, finalUrl);
  const gallery = [hero, ...pageImages].filter((v, i, a): v is string => Boolean(v) && a.indexOf(v) === i).slice(0, 10);

  // --- name / blurb / category ---
  let name = (ogSite || ldName || ogTitle || rawTitle || host).trim();
  name = name.replace(/\s*[|–—-]\s*(home|official site|wedding.*|photography|catering).*$/i, "").trim();
  if (name.length > 60) name = name.slice(0, 57).trim() + "…";

  let blurb = (ogDesc || "").replace(/\s+/g, " ").trim();
  if (blurb.length > 300) blurb = blurb.slice(0, 297).trim() + "…";

  const category = inferCategory(`${name} ${blurb} ${rawTitle} ${finalUrl}`);

  const profile = {
    website: origin,
    email,
    phone,
    location,
    instagram,
    logo,
    image: hero,
    blurb: blurb || undefined,
    gallery,
    sourceUrl: finalUrl,
    fetchedAt: new Date().toISOString(),
  };

  const enoughData = Boolean(blurb || gallery.length || email || phone);
  return NextResponse.json({
    ok: true,
    name,
    category,
    profile,
    thin: !enoughData, // signal the UI that the site was sparse
  }, { status: 200 });
}
