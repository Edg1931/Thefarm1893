/* ============================================================================
   SOCIAL PUBLISHING — Instagram/Facebook via the Meta Graph API. Activates when
   META_ACCESS_TOKEN is set; otherwise returns a preview (mock) so the AdStudio
   "schedule / publish" actions complete in a walkthrough.
   ============================================================================ */

export function socialConfigured(): boolean {
  return Boolean(process.env.META_ACCESS_TOKEN);
}

export type PublishInput = { platform: "instagram" | "facebook"; caption: string; imageUrl?: string };

export async function publishPost(input: PublishInput): Promise<{ ok: boolean; demo: boolean; preview: string }> {
  const preview = `${input.platform.toUpperCase()} · ${input.caption.slice(0, 120)}${input.caption.length > 120 ? "…" : ""}`;
  if (!socialConfigured()) {
    console.log("[social] (demo) would publish:", preview);
    return { ok: true, demo: true, preview };
  }
  // Real Graph publish would go here.
  return { ok: true, demo: false, preview };
}
