/* ============================================================================
   STORAGE — private document uploads (contracts, invoices, insurance, etc.).
   Mirrors the public `Photos` bucket pattern in lib/images.ts, but targets a
   PRIVATE `documents` bucket so client files aren't world-readable. Demo mode
   (no service role key) returns a placeholder URL so the upload flow completes
   in a walkthrough without a real bucket.
   ============================================================================ */

import { getServiceClient } from "@/lib/supabase/server";

export const DOCUMENTS_BUCKET = "documents";

export function uploadsConfigured(): boolean {
  return Boolean(getServiceClient());
}

/**
 * Create a short-lived signed upload URL the browser can PUT a file to. In demo
 * mode returns a placeholder so the flow still completes (no bytes stored).
 */
export async function createSignedUpload(path: string): Promise<{ url: string; path: string; demo: boolean }> {
  const sb = getServiceClient();
  if (!sb) return { url: `#demo-upload/${encodeURIComponent(path)}`, path, demo: true };
  try {
    const { data, error } = await sb.storage.from(DOCUMENTS_BUCKET).createSignedUploadUrl(path);
    if (error) throw error;
    return { url: data.signedUrl, path, demo: false };
  } catch (e) {
    console.error("[storage] createSignedUpload", e);
    return { url: `#demo-upload/${encodeURIComponent(path)}`, path, demo: true };
  }
}

/** A short-lived signed download URL for a stored private document. */
export async function signedDownloadUrl(path: string, expiresSec = 3600): Promise<string> {
  const sb = getServiceClient();
  if (!sb || path === "#" || path.startsWith("#demo")) return "#";
  try {
    const { data, error } = await sb.storage.from(DOCUMENTS_BUCKET).createSignedUrl(path, expiresSec);
    if (error) throw error;
    return data.signedUrl;
  } catch {
    return "#";
  }
}
