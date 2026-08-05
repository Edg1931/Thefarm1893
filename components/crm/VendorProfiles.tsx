"use client";

import { useState, useRef } from "react";
import {
  X, Globe, Loader2, Sparkles, Check, Mail, Phone, Instagram, MapPin,
  ImageOff, RefreshCw, ExternalLink, DownloadCloud,
} from "lucide-react";
import { type VendorRecord, type VendorProfile } from "@/lib/crm/sample-data";
import { newId } from "@/lib/crm/store";
import { useModalClose } from "@/lib/useModalClose";

const CATEGORIES = ["Photography", "Videography", "Catering", "Florals", "Music", "Planning", "Beauty", "Cake", "Bar Service", "Rentals", "Other"];
const MEMBERSHIP: Record<string, number> = { preferred: 1200, featured: 600, listed: 0 };

type EnrichResult = { ok: boolean; name?: string; category?: string; profile?: VendorProfile; thin?: boolean; error?: string };

async function enrich(url: string): Promise<EnrichResult> {
  try {
    const res = await fetch("/api/vendors/enrich", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }),
    });
    return (await res.json()) as EnrichResult;
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

/** Image that quietly disappears if the remote URL fails to load. */
function SafeImg({ src, className, alt = "" }: { src: string; className?: string; alt?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} className={className} />;
}

/* ============================ Import (auto-scrape) ============================ */
export function ImportVendorModal({
  onClose, onSave,
}: {
  onClose: () => void;
  onSave: (record: VendorRecord, profile: VendorProfile) => void;
}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<EnrichResult | null>(null);

  // Editable fields (seeded from the scrape)
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Other");
  const [blurb, setBlurb] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tier, setTier] = useState<"preferred" | "featured" | "listed">("listed");
  const [picked, setPicked] = useState<Set<string>>(new Set());

  async function run() {
    if (!url.trim()) return;
    setLoading(true); setError(null); setRes(null);
    const r = await enrich(url.trim());
    setLoading(false);
    if (!r.ok) { setError(r.error ?? "Couldn't read that site."); return; }
    setRes(r);
    setName(r.name ?? "");
    setCategory(r.category ?? "Other");
    setBlurb(r.profile?.blurb ?? "");
    setEmail(r.profile?.email ?? "");
    setPhone(r.profile?.phone ?? "");
    setPicked(new Set(r.profile?.gallery ?? []));
  }

  function toggle(img: string) {
    setPicked((s) => { const n = new Set(s); n.has(img) ? n.delete(img) : n.add(img); return n; });
  }

  function save() {
    const p = res?.profile ?? {};
    const record: VendorRecord = {
      id: newId("V"), name: name || "New Vendor", category, tier, status: "pending",
      referralsSent: 0, bookedFromReferrals: 0, commissionRate: 10, commissionEarnedYTD: 0,
      rating: 0, membershipFee: MEMBERSHIP[tier],
    };
    const profile: VendorProfile = {
      ...p, blurb: blurb || undefined, email: email || undefined, phone: phone || undefined,
      gallery: [...picked],
      image: picked.has(p.image ?? "") ? p.image : ([...picked][0] ?? p.image),
    };
    onSave(record, profile);
  }

  const gallery = res?.profile?.gallery ?? [];

  return (
    <Shell onClose={onClose} title="Import a vendor from their website" icon={<DownloadCloud size={20} className="text-brass" />} wide>
      {/* URL bar */}
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink/15 bg-bone px-3">
          <Globe size={16} className="text-stone" />
          <input
            value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run()}
            placeholder="vendorwebsite.com, their Google page, or Instagram URL"
            className="w-full bg-transparent py-3 text-sm outline-none"
          />
        </div>
        <button onClick={run} disabled={loading || !url.trim()} className="btn btn-primary !py-2.5 !text-xs disabled:opacity-60">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Fetch
        </button>
      </div>
      <p className="mt-2 text-xs text-stone">We pull their real photos, description, and contact info automatically — you tidy it up, then save.</p>
      {error && <p className="mt-3 rounded-lg bg-terracotta/10 px-3 py-2 text-sm text-terracotta">{error}</p>}

      {res?.ok && (
        <div className="mt-5 space-y-5">
          {res.thin && <p className="rounded-lg bg-brass/10 px-3 py-2 text-xs text-ink-soft">That site was light on data — fill in what's missing below.</p>}

          {/* Hero + core fields */}
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <div className="h-32 w-full overflow-hidden rounded-xl bg-bone sm:h-full">
              {res.profile?.image
                ? <SafeImg src={res.profile.image} className="h-full w-full object-cover" alt={name} />
                : <div className="grid h-full place-items-center text-stone"><ImageOff size={22} /></div>}
            </div>
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <L label="Vendor name"><input value={name} onChange={(e) => setName(e.target.value)} className={inp} /></L>
                <L label="Category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inp}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </L>
              </div>
              <L label="Description (from their site)">
                <textarea value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={3} className={inp} />
              </L>
            </div>
          </div>

          {/* Contact */}
          <div className="grid gap-3 sm:grid-cols-2">
            <L label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inp} placeholder="—" /></L>
            <L label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inp} placeholder="—" /></L>
          </div>
          {(res.profile?.location || res.profile?.instagram || res.profile?.website) && (
            <div className="flex flex-wrap gap-2 text-xs text-stone">
              {res.profile?.website && <Chip icon={<Globe size={12} />}>{new URL(res.profile.website).hostname.replace(/^www\./, "")}</Chip>}
              {res.profile?.location && <Chip icon={<MapPin size={12} />}>{res.profile.location}</Chip>}
              {res.profile?.instagram && <Chip icon={<Instagram size={12} />}>Instagram found</Chip>}
            </div>
          )}

          {/* Gallery picker */}
          {gallery.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone">Portfolio — tap to include ({picked.size} selected)</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {gallery.map((img) => {
                  const on = picked.has(img);
                  return (
                    <button key={img} type="button" onClick={() => toggle(img)}
                      className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition ${on ? "ring-brass" : "ring-transparent hover:ring-ink/20"}`}>
                      <SafeImg src={img} className="h-full w-full object-cover" />
                      {on && <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-brass text-parchment"><Check size={12} /></span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tier */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone">Partner tier</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["preferred", "featured", "listed"] as const).map((t) => (
                <button type="button" key={t} onClick={() => setTier(t)}
                  className={`rounded-xl px-3 py-2.5 text-center text-sm capitalize transition ${tier === t ? "bg-ink text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>
                  {t}<span className="block text-[0.65rem] opacity-70">{MEMBERSHIP[t] ? `$${MEMBERSHIP[t]}/yr` : "Free"}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 !py-2.5">Cancel</button>
            <button type="button" onClick={save} className="btn btn-primary flex-1 !py-2.5"><Check size={15} /> Save Vendor + Profile</button>
          </div>
        </div>
      )}
    </Shell>
  );
}

/* ============================ View mini-profile ============================ */
export function VendorProfileModal({
  vendor, profile, onClose, onRefresh,
}: {
  vendor: VendorRecord; profile?: VendorProfile; onClose: () => void;
  onRefresh: (id: string, profile: VendorProfile) => void;
}) {
  const [url, setUrl] = useState(profile?.sourceUrl ?? profile?.website ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!url.trim()) return;
    setLoading(true); setError(null);
    const r = await enrich(url.trim());
    setLoading(false);
    if (!r.ok || !r.profile) { setError(r.error ?? "Couldn't refresh."); return; }
    onRefresh(vendor.id, r.profile);
  }

  const gallery = profile?.gallery ?? [];

  return (
    <Shell onClose={onClose} title={vendor.name} icon={profile?.logo ? <SafeImg src={profile.logo} className="h-6 w-6 rounded" /> : <Globe size={18} className="text-brass" />} wide>
      <p className="-mt-3 text-sm text-stone">{vendor.category}{profile?.location ? ` · ${profile.location}` : ""}</p>

      {profile ? (
        <div className="mt-4 space-y-4">
          {profile.image && (
            <div className="h-44 w-full overflow-hidden rounded-xl bg-bone">
              <SafeImg src={profile.image} className="h-full w-full object-cover" alt={vendor.name} />
            </div>
          )}
          {profile.blurb && <p className="text-sm leading-relaxed text-ink-soft">{profile.blurb}</p>}

          <div className="flex flex-wrap gap-2 text-sm">
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full bg-bone px-3 py-1.5 text-ink-soft hover:bg-linen"><Globe size={14} /> Website <ExternalLink size={12} /></a>}
            {profile.email && <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 rounded-full bg-bone px-3 py-1.5 text-ink-soft hover:bg-linen"><Mail size={14} /> {profile.email}</a>}
            {profile.phone && <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 rounded-full bg-bone px-3 py-1.5 text-ink-soft hover:bg-linen"><Phone size={14} /> {profile.phone}</a>}
            {profile.instagram && <a href={profile.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-full bg-bone px-3 py-1.5 text-ink-soft hover:bg-linen"><Instagram size={14} /> Instagram</a>}
          </div>

          {gallery.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone">Their work</p>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {gallery.map((img) => (
                  <div key={img} className="aspect-square overflow-hidden rounded-lg bg-bone">
                    <SafeImg src={img} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-bone p-4 text-sm text-ink-soft">No profile yet. Paste their website below and we'll build one automatically.</p>
      )}

      {/* Refresh / import from site */}
      <div className="mt-5 border-t border-ink/8 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone">{profile ? "Refresh from their site" : "Import from their site"}</p>
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink/15 bg-bone px-3">
            <Globe size={15} className="text-stone" />
            <input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && refresh()} placeholder="vendorwebsite.com" className="w-full bg-transparent py-2.5 text-sm outline-none" />
          </div>
          <button onClick={refresh} disabled={loading || !url.trim()} className="btn btn-primary !py-2 !text-xs disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} {profile ? "Refresh" : "Fetch"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-terracotta">{error}</p>}
      </div>
    </Shell>
  );
}

/* ============================ shared bits ============================ */
const inp = "w-full rounded-xl border border-ink/15 bg-bone px-3 py-2.5 text-sm outline-none focus:border-sage";

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider text-stone">{label}</span>{children}</label>;
}
function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <span className="flex items-center gap-1 rounded-full bg-bone px-2.5 py-1">{icon}{children}</span>;
}
function Shell({ title, icon, children, onClose, wide }: { title: string; icon?: React.ReactNode; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalClose(onClose, dialogRef);
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" className={`max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-parchment p-7 shadow-2xl ${wide ? "max-w-2xl" : "max-w-lg"}`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl text-ink">{icon} {title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
