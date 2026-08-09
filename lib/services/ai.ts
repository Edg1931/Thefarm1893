/* ============================================================================
   PLUGGABLE AI CORE
   One thin wrapper around Claude. If ANTHROPIC_API_KEY is set it calls the real
   model; otherwise it returns a deterministic, useful mock so the whole product
   is demoable with zero setup. Everything AI-powered in the app routes through
   generateText() — swap the provider here in one place.
   ============================================================================ */

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const aiEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

// Current, generally-available model. Sonnet is the right default here: Rosie
// answers every public visitor, so it balances quality against per-call cost.
// Override with AI_MODEL for a more capable model on the same code path.
const MODEL = process.env.AI_MODEL || "claude-sonnet-5";

/**
 * One line per server process saying which path AI is actually taking.
 *
 * Every failure below degrades to the mock so the UX never breaks — which is
 * right, but it means a wrong key, an expired key, a rate limit, and no key at
 * all all look identical from the outside: plausible canned answers. This is
 * the same silent-failure shape that made the Storage bug so hard to find, so
 * the state is stated explicitly instead of inferred.
 */
let announced = false;
function announce(msg: string) {
  if (announced) return;
  announced = true;
  console.log(`[ai] ${msg}`);
}

export async function generateText(opts: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  /** deterministic fallback used when no API key is configured */
  mock: () => string;
}): Promise<{ text: string; mocked: boolean }> {
  if (!aiEnabled()) {
    announce("ANTHROPIC_API_KEY is NOT set — serving deterministic fallback replies.");
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
    if (!res.ok) {
      // Say WHY. A 401 (bad key), 404 (bad model id) and 429 (rate limit) all
      // produce identical-looking fallback text otherwise.
      const body = await res.text().catch(() => "");
      console.error(`[ai] Anthropic ${res.status} using model "${MODEL}" — falling back. ${body.slice(0, 300)}`);
      return { text: opts.mock(), mocked: true };
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text?.trim();
    if (!text) {
      console.error("[ai] Anthropic returned no text — falling back.");
      return { text: opts.mock(), mocked: true };
    }
    announce(`live — model "${MODEL}" answering.`);
    return { text, mocked: false };
  } catch (e) {
    // Never break the UX — but never hide it either.
    console.error(`[ai] request failed using model "${MODEL}" — falling back.`, e);
    return { text: opts.mock(), mocked: true };
  }
}
