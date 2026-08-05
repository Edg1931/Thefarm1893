import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/api/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "The photos I uploaded aren't showing" — this answers *why*, instead of
 * leaving it to guesswork.
 *
 * The site reads a fixed set of folder names out of one public bucket. Almost
 * every failure is one of four things, and each is invisible from the outside:
 *   1. the bucket is named something other than `Photos` (names are CASE
 *      SENSITIVE — `photos` is a different bucket entirely)
 *   2. the bucket isn't public, so listing works but every image URL 400s
 *   3. the photos went into folders the site doesn't read (`Gallery/`,
 *      `Farm Photos/`, or loose at the bucket root)
 *   4. only the anon key is set and the storage list policy is missing, so
 *      every folder comes back empty with no error
 *
 * So: report the real bucket list, the real folder names with counts, and the
 * live HTTP status of an actual image URL.
 */

const BUCKET = "Photos";
const IMG_EXT = /\.(jpe?g|png|webp|avif)$/i;

/** Folders the site actually reads, and where they surface. */
const EXPECTED = [
  { folder: "hero", used: "Homepage + gallery hero background" },
  { folder: "gallery", used: "Homepage strip and the /gallery page" },
  { folder: "heroes", used: "Per-page hero banners — one file named after the page, e.g. heroes/venue.jpg" },
  { folder: "venue", used: "Homepage 'Explore' — the venue category" },
  { folder: "bridal-prep", used: "Homepage 'Explore' — the bridal-prep category" },
  { folder: "silos", used: "Homepage 'Explore' — plus silos/<slug>/ per silo page" },
];

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const key = service || anon;

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      problem: "Supabase isn't configured on this deployment, so the site can't reach Storage at all.",
      fix: "Add NEXT_PUBLIC_SUPABASE_URL and the keys in Vercel → Settings → Environment Variables, then redeploy.",
      buckets: [], expected: [], rootEntries: [], sampleUrl: null,
    });
  }

  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const usingKey = service ? "service_role (bypasses storage policies)" : "anon (needs the storage list policy)";

  // 1. Which buckets exist, and is ours public?
  let buckets: { name: string; public: boolean }[] = [];
  let bucketError: string | null = null;
  try {
    const { data, error } = await sb.storage.listBuckets();
    if (error) throw error;
    buckets = (data ?? []).map((b) => ({ name: b.name, public: Boolean(b.public) }));
  } catch (e) {
    bucketError = e instanceof Error ? e.message : "Could not list buckets.";
  }
  const bucket = buckets.find((b) => b.name === BUCKET);
  const caseMismatch = !bucket ? buckets.find((b) => b.name.toLowerCase() === BUCKET.toLowerCase()) : undefined;

  // 2. What's actually at the bucket root? Shows folders named differently
  //    than the site expects, and photos dropped loose with no folder at all.
  let rootEntries: { name: string; kind: "folder" | "file" }[] = [];
  try {
    const { data } = await sb.storage.from(BUCKET).list("", { limit: 100, sortBy: { column: "name", order: "asc" } });
    rootEntries = (data ?? [])
      .filter((f) => f.name && f.name !== ".emptyFolderPlaceholder")
      .map((f) => ({ name: f.name, kind: f.id === null ? ("folder" as const) : ("file" as const) }));
  } catch { /* reported via bucketError / empty counts */ }

  // 3. Per-folder counts for the folders the site reads.
  const expected = await Promise.all(
    EXPECTED.map(async (e) => {
      try {
        const { data, error } = await sb.storage.from(BUCKET).list(e.folder, { limit: 100 });
        if (error) throw error;
        const rows = data ?? [];
        const images = rows.filter((f) => f.name && IMG_EXT.test(f.name));
        const subfolders = rows.filter((f) => f.id === null && f.name && f.name !== ".emptyFolderPlaceholder");
        const skipped = rows.filter((f) => f.id !== null && f.name && f.name !== ".emptyFolderPlaceholder" && !IMG_EXT.test(f.name));
        return {
          ...e,
          images: images.length,
          subfolders: subfolders.map((f) => f.name),
          // Files the site ignores — HEIC straight off an iPhone is the usual culprit.
          skipped: skipped.map((f) => f.name).slice(0, 6),
          firstFile: images[0]?.name ?? null,
        };
      } catch {
        return { ...e, images: 0, subfolders: [], skipped: [], firstFile: null };
      }
    }),
  );

  // 4. The decisive test: does a real image URL actually load over HTTP?
  //    Listing can succeed while every URL 400s, if the bucket isn't public.
  let sampleUrl: { url: string; status: number; ok: boolean } | null = null;
  const withFile = expected.find((e) => e.firstFile);
  if (withFile?.firstFile) {
    const u = `${url}/storage/v1/object/public/${BUCKET}/${encodeURI(`${withFile.folder}/${withFile.firstFile}`)}`;
    try {
      const res = await fetch(u, { method: "HEAD", cache: "no-store" });
      sampleUrl = { url: u, status: res.status, ok: res.ok };
    } catch {
      sampleUrl = { url: u, status: 0, ok: false };
    }
  }

  // ---- turn all of that into one plain-language verdict --------------------
  const totalImages = expected.reduce((s, e) => s + e.images, 0);
  let problem: string | null = null;
  let fix: string | null = null;

  if (bucketError) {
    problem = `Couldn't reach Storage: ${bucketError}`;
    fix = "Check that SUPABASE_SERVICE_ROLE_KEY belongs to this same project.";
  } else if (!bucket && caseMismatch) {
    problem = `Your bucket is named "${caseMismatch.name}", but the site reads "${BUCKET}". Bucket names are case sensitive.`;
    fix = `Rename the bucket to exactly "${BUCKET}", or create it and move the photos across.`;
  } else if (!bucket) {
    problem = `There's no bucket named "${BUCKET}". Found: ${buckets.map((b) => b.name).join(", ") || "none"}.`;
    fix = `Storage → New bucket → name it exactly "${BUCKET}" → mark it PUBLIC.`;
  } else if (!bucket.public) {
    problem = `The "${BUCKET}" bucket is PRIVATE, so every image URL is rejected by Supabase even though the files are there.`;
    fix = `Storage → ${BUCKET} → Settings → make the bucket public.`;
  } else if (totalImages === 0 && rootEntries.length > 0) {
    const folders = rootEntries.filter((r) => r.kind === "folder").map((r) => r.name);
    const loose = rootEntries.filter((r) => r.kind === "file").length;
    problem = loose > 0 && folders.length === 0
      ? `${loose} file${loose === 1 ? " is" : "s are"} sitting loose at the top of the bucket. The site only reads photos inside named folders.`
      : `Your folders are named ${folders.map((f) => `"${f}"`).join(", ")}, but the site reads ${EXPECTED.map((e) => `"${e.folder}"`).join(", ")}. Folder names are case sensitive.`;
    fix = "Rename your folders to match the list below, or move the photos into folders with those exact names.";
  } else if (totalImages === 0) {
    problem = service
      ? "The bucket is reachable but every folder came back empty."
      : "Every folder came back empty. Only the anon key is set, so listing needs the storage policy from schema.sql.";
    fix = service
      ? "Confirm the photos are in this project's Photos bucket (not a different Supabase project)."
      : "Add SUPABASE_SERVICE_ROLE_KEY in Vercel, or run the `Public list photos bucket` policy at the end of schema.sql.";
  } else if (sampleUrl && !sampleUrl.ok) {
    problem = `Files are listed, but loading one returned HTTP ${sampleUrl.status}. The files exist; serving them is what's failing.`;
    fix = "This is almost always a non-public bucket. Storage → Photos → Settings → make it public.";
  }

  return NextResponse.json({
    ok: !problem,
    problem,
    fix,
    usingKey,
    bucket: bucket ?? null,
    buckets,
    rootEntries,
    expected,
    totalImages,
    sampleUrl,
  });
}
