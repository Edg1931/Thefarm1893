/* ============================================================================
   PHOTOS — pull the venue's real images from the Supabase Storage `photos`
   bucket (folders: hero/, gallery/, silos/<slug>/). The seller manages photos
   by drag-and-drop in Supabase; the site reflects them automatically.
   Falls back to the stock imagery whenever a folder is empty or the DB isn't
   configured (local/demo), so nothing ever renders blank.
   ============================================================================ */

import { createClient } from "@supabase/supabase-js";

const BUCKET = "Photos";
const IMG_EXT = /\.(jpe?g|png|webp|avif)$/i;

/**
 * Client used only to LIST the public photos bucket. Prefers the service-role
 * key (bypasses RLS) but falls back to the anon key so listing still works when
 * only the public keys are set — the anon path needs the storage list policy
 * from schema.sql (`Public list photos bucket`).
 */
function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function publicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  // encodeURIComponent per segment, not encodeURI on the whole path: encodeURI
  // leaves #, ?, and & alone, and a filename like "barn #2.jpg" would otherwise
  // truncate the URL at the hash and 404.
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

/**
 * Storage folder names are case sensitive, but there's no reason the website
 * should be. If `gallery` comes back empty we look for a folder that differs
 * only in case (`Gallery`, `GALLERY`) and use that instead — uploading into a
 * capitalised folder is an easy mistake and shouldn't blank the page.
 *
 * Only runs on the empty path, so the normal case costs no extra request.
 * Memoised briefly because a single page render calls this several times.
 */
let rootCache: { at: number; names: string[] } | null = null;

/**
 * One line, once per server process, saying what the bucket ACTUALLY contains.
 *
 * This is deliberately unconditional rather than only-on-failure. Storage
 * returns an empty array for a folder that doesn't exist, exactly as it does
 * for a folder that exists and is empty — so a folder-name mismatch produces
 * no error, no exception, and no log anywhere. Silence was indistinguishable
 * from success, which is what made this hard to pin down.
 *
 * Names only: no URLs, no credentials.
 */
let reported = false;

async function reportBucketOnce(sb: NonNullable<ReturnType<typeof storageClient>>, context: string) {
  if (reported) return;
  reported = true;
  try {
    const { data, error } = await sb.storage.from(BUCKET).list("", { limit: 100, sortBy: { column: "name", order: "asc" } });
    if (error) {
      console.error(`[images] bucket "${BUCKET}" could not be listed (asked for "${context}"): ${error.message}`);
      return;
    }
    const entries = (data ?? []).filter((f) => f.name && f.name !== ".emptyFolderPlaceholder");
    const folders = entries.filter((f) => f.id === null).map((f) => f.name);
    const files = entries.filter((f) => f.id !== null).map((f) => f.name);
    console.log(
      `[images] bucket "${BUCKET}" top level — folders: [${folders.join(", ") || "NONE"}] · ` +
      `loose files: [${files.slice(0, 20).join(", ") || "none"}]${files.length > 20 ? ` (+${files.length - 20} more)` : ""} ` +
      `· site reads: [hero, gallery, heroes, venue, bridal-prep, silos]`,
    );
  } catch (e) {
    console.error("[images] bucket report failed", e);
  }
}

async function realFolderName(sb: NonNullable<ReturnType<typeof storageClient>>, folder: string): Promise<string | null> {
  try {
    if (!rootCache || Date.now() - rootCache.at > 60_000) {
      const { data } = await sb.storage.from(BUCKET).list("", { limit: 100 });
      rootCache = { at: Date.now(), names: (data ?? []).filter((f) => f.id === null && f.name).map((f) => f.name) };
    }
    const want = folder.toLowerCase();
    return rootCache.names.find((n) => n.toLowerCase() === want && n !== folder) ?? null;
  } catch {
    return null;
  }
}

/** Public URLs of the images in a folder of the `photos` bucket (empty on any failure). */
export async function listPhotos(folder: string): Promise<string[]> {
  const sb = storageClient();
  if (!sb) return [];
  const read = async (name: string) => {
    const { data, error } = await sb.storage.from(BUCKET).list(name, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    return (data ?? [])
      .filter((f) => f.name && IMG_EXT.test(f.name))
      .map((f) => publicUrl(`${name}/${f.name}`));
  };
  try {
    await reportBucketOnce(sb, folder);
    const hit = await read(folder);
    if (hit.length) return hit;
    const alt = await realFolderName(sb, folder);
    return alt ? await read(alt) : [];
  } catch (e) {
    console.error("[images] list", folder, e);
    return [];
  }
}

/**
 * Photos in a folder AND one level of subfolders (e.g. venue/ + venue/inside/ +
 * venue/outside/). Lets the seller drop photos directly in a category folder or
 * split them into inside/outside — either way they all show.
 */
export async function listPhotosDeep(folder: string): Promise<string[]> {
  const sb = storageClient();
  if (!sb) return [];
  try {
    await reportBucketOnce(sb, folder);
    const first = await sb.storage.from(BUCKET).list(folder, { limit: 100, sortBy: { column: "name", order: "asc" } });
    if (first.error) throw first.error;
    let data = first.data;
    // Same case-insensitive rescue as listPhotos.
    if (!(data ?? []).length) {
      const alt = await realFolderName(sb, folder);
      if (alt) {
        const retry = await sb.storage.from(BUCKET).list(alt, { limit: 100, sortBy: { column: "name", order: "asc" } });
        if (!retry.error) { data = retry.data; folder = alt; }
      }
    }
    const files: string[] = [];
    const subfolders: string[] = [];
    for (const f of data ?? []) {
      if (f.name && IMG_EXT.test(f.name)) files.push(publicUrl(`${folder}/${f.name}`));
      else if (f.id === null && f.name) subfolders.push(f.name); // folders have id === null
    }
    const nested = await Promise.all(
      subfolders.map(async (sf) => {
        const { data: sd } = await sb.storage.from(BUCKET).list(`${folder}/${sf}`, { limit: 100, sortBy: { column: "name", order: "asc" } });
        return (sd ?? []).filter((x) => x.name && IMG_EXT.test(x.name)).map((x) => publicUrl(`${folder}/${sf}/${x.name}`));
      })
    );
    return [...files, ...nested.flat()];
  } catch (e) {
    console.error("[images] listDeep", folder, e);
    return [];
  }
}

/** All photos in a folder, or the provided stock fallback if none are uploaded. */
export async function photosOr(folder: string, fallback: string[]): Promise<string[]> {
  const live = await listPhotos(folder);
  return live.length ? live : fallback;
}

/** First photo in a folder, or the stock fallback. */
export async function heroOr(folder: string, fallback: string): Promise<string> {
  const live = await listPhotos(folder);
  return live[0] ?? fallback;
}

/**
 * Hero image for a named page, from a single `heroes/` folder where the seller
 * drops one file per page (e.g. heroes/weddings.jpg, heroes/about.jpg). Falls
 * back to the stock image when the file isn't there.
 */
export async function heroFor(name: string, fallback: string): Promise<string> {
  const sb = storageClient();
  if (!sb) return fallback;
  const read = async (dir: string) => {
    const { data, error } = await sb.storage.from(BUCKET).list(dir, { limit: 100 });
    if (error) throw error;
    const match = (data ?? []).find(
      (f) => f.name && IMG_EXT.test(f.name) && f.name.replace(/\.[^.]+$/, "").toLowerCase() === name.toLowerCase()
    );
    return match ? publicUrl(`${dir}/${match.name}`) : null;
  };
  try {
    await reportBucketOnce(sb, "heroes");
    const hit = await read("heroes");
    if (hit) return hit;
    const alt = await realFolderName(sb, "heroes");
    return (alt ? await read(alt) : null) ?? fallback;
  } catch (e) {
    console.error("[images] heroFor", name, e);
    return fallback;
  }
}
