/* ============================================================================
   PHOTOS — pull the venue's real images from the Supabase Storage `photos`
   bucket (folders: hero/, gallery/, silos/<slug>/). The seller manages photos
   by drag-and-drop in Supabase; the site reflects them automatically.
   Falls back to the stock imagery whenever a folder is empty or the DB isn't
   configured (local/demo), so nothing ever renders blank.
   ============================================================================ */

import { getServiceClient } from "@/lib/supabase/server";

const BUCKET = "photos";
const IMG_EXT = /\.(jpe?g|png|webp|avif)$/i;

function publicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${BUCKET}/${encodeURI(path)}`;
}

/** Public URLs of the images in a folder of the `photos` bucket (empty on any failure). */
export async function listPhotos(folder: string): Promise<string[]> {
  const sb = getServiceClient();
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
