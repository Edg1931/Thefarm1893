/* ============================================================================
   PLUGGABLE AI IMAGE GENERATION
   Generates bespoke wedding imagery from a text prompt (season + palette + style
   at The Farm 1893). Activates automatically when an image-generation key is
   present; otherwise returns null so callers fall back to curated, color-matched
   photography. Supports OpenAI Images out of the box; Adobe Firefly Services or
   any other provider can be dropped in here in one place.
   ============================================================================ */

export const imageAIEnabled = () => Boolean(process.env.OPENAI_API_KEY);

/** Returns an array of image URLs (or data URLs), or null if generation is off/failed. */
export async function generateImages(prompt: string, count = 4): Promise<string[] | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.IMAGE_MODEL || "gpt-image-1",
        prompt,
        n: count,
        size: "1024x1024",
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const urls: string[] = (data?.data ?? [])
      .map((d: { url?: string; b64_json?: string }) =>
        d.url ? d.url : d.b64_json ? `data:image/png;base64,${d.b64_json}` : null
      )
      .filter(Boolean);
    return urls.length ? urls : null;
  } catch {
    return null;
  }
}
