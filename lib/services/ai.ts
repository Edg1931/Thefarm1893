/* ============================================================================
   PLUGGABLE AI CORE
   One thin wrapper around Claude. If ANTHROPIC_API_KEY is set it calls the real
   model; otherwise it returns a deterministic, useful mock so the whole product
   is demoable with zero setup. Everything AI-powered in the app routes through
   generateText() — swap the provider here in one place.
   ============================================================================ */

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

const MODEL = process.env.AI_MODEL || "claude-opus-4-8";

export async function generateText(opts: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  /** deterministic fallback used when no API key is configured */
  mock: () => string;
}): Promise<{ text: string; mocked: boolean }> {
  if (!aiEnabled()) {
    return { text: opts.mock(), mocked: true };
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY as string,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: opts.maxTokens ?? 700,
        system: opts.system,
        messages: opts.messages,
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}`);
    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    return { text: text || opts.mock(), mocked: false };
  } catch {
    // Never break the UX — fall back to the mock.
    return { text: opts.mock(), mocked: true };
  }
}
