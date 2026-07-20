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
  return `${base}/storage/v1/object/public/${BUCKET}/${encodeURI(path)}`;
}

/** Public URLs of the images in a folder of the `photos` bucket (empty on any failure). */
export async function listPhotos(folder: string): Promise<string[]> {
  const sb = storageClient();
  if (!sb) return [];
  try {
    const { data, error } = await sb.storage.from(BUCKET).list(folder, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    return (data ?? [])
      .filter((f) => f.name && IMG_EXT.test(f.name))
      .map((f) => publicUrl(`${folder}/${f.name}`));
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
    const { data, error } = await sb.storage.from(BUCKET).list(folder, { limit: 100, sortBy: { column: "name", order: "asc" } });
    if (error) throw error;
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
