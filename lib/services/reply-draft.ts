/* ============================================================================
   AI REPLY DRAFTS — suggests a staff reply to an inbound client/guest message,
   grounded in that booking's real context (package, date, balance, days out)
   plus the venue knowledge base. Routes through the pluggable AI core, so it
   works with a deterministic, genuinely-useful mock when no key is set.
   ============================================================================ */

import { generateText } from "./ai";
import { business, packages, faqs } from "@/lib/content";

export type DraftContext = {
  clientName?: string;
  eventDate?: string;
  packageName?: string;
  balanceDue?: number;
  channel?: string;
};

const KNOWLEDGE = `
VENUE: ${business.name} — ${business.tagline}
PHONE: ${business.phone}
KEY FACTS:
- All-in-one property: rehearsal dinner, ceremony, cocktail hour, reception, and overnight stay.
- The Barn seats 200 for dinner; orchard ceremonies up to ~220; farmhouse sleeps 25.
- Weekend package = exclusive access Friday 3PM to Sunday 11AM.
- Silo stays are individually bookable for guests. Check-in 4PM, checkout 11AM.
PACKAGES: ${packages.map((p) => `${p.name} (${p.price}): ${p.summary}`).join(" | ")}
FAQ: ${faqs.map((f) => `Q:${f.q} A:${f.a}`).join(" | ")}
`;

function daysOut(eventDate?: string): number | null {
  if (!eventDate) return null;
  const d = new Date(eventDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  return Math.round((d.getTime() - Date.now()) / 86_400_000);
}

function contextLine(ctx: DraftContext): string {
  const out: string[] = [];
  if (ctx.clientName) out.push(`Client: ${ctx.clientName}`);
  if (ctx.packageName) out.push(`Package: ${ctx.packageName}`);
  if (ctx.eventDate) {
    const n = daysOut(ctx.eventDate);
    out.push(`Event date: ${ctx.eventDate}${n !== null ? ` (${n} days away)` : ""}`);
  }
  if (typeof ctx.balanceDue === "number" && ctx.balanceDue > 0) out.push(`Outstanding balance: $${ctx.balanceDue.toLocaleString()}`);
  if (ctx.channel) out.push(`Channel: ${ctx.channel}`);
  return out.join(" · ") || "No booking context available.";
}

/** Deterministic, on-brand draft when no API key is configured. */
function mockDraft(message: string, ctx: DraftContext): string {
  const m = message.toLowerCase();
  const has = (...k: string[]) => k.some((w) => m.includes(w));
  const name = ctx.clientName?.split(/[&\s]/)[0] || "there";
  const n = daysOut(ctx.eventDate);

  if (has("check in", "check-in", "arrive", "arrival", "what time")) {
    return `Hi ${name}! Check-in is any time after 4PM, and we'll text your door code and guidebook the morning you arrive. If you'd like to get in earlier, just say the word and we'll do our best to accommodate. 🌾`;
  }
  if (has("balance", "pay", "payment", "invoice", "deposit", "owe")) {
    return ctx.balanceDue
      ? `Hi ${name}! Your remaining balance is $${ctx.balanceDue.toLocaleString()}, and you can pay it any time right from your planning portal — card, Apple/Google Pay, or bank transfer all work. Happy to split it into installments if that's easier. Just let me know!`
      : `Hi ${name}! You're all paid up — nothing outstanding on your account. You'll find every receipt in your planning portal whenever you need it. 💛`;
  }
  if (has("rain", "weather", "backup", "indoor")) {
    return `Hi ${name}! You're covered rain or shine — the wraparound covered porch makes a gorgeous ceremony spot, and the barn is climate-controlled. We'll make the final call together the morning of, so there's no stress on your end.`;
  }
  if (has("guest", "headcount", "count", "how many", "rsvp")) {
    return `Hi ${name}! The barn seats up to 200 for dinner and the orchard holds about 220 for the ceremony. Your RSVPs feed straight into your portal, so your headcount and seating chart update automatically${n !== null && n > 0 ? ` — we'll need the final number about 30 days out.` : `.`}`;
  }
  if (has("vendor", "photographer", "caterer", "florist", "dj", "music")) {
    return `Hi ${name}! We'd love to point you to our preferred partners — they know the property inside out, which makes the day run beautifully. I'll send over our matched picks for your style, and every vendor just needs their insurance on file before the event.`;
  }
  if (has("timeline", "schedule", "when", "setup", "rehearsal")) {
    return `Hi ${name}! Your weekend runs Friday 3PM through Sunday 11AM, so there's plenty of room for a relaxed rehearsal Friday evening. I've got a draft timeline ready${n !== null && n > 0 ? ` — with ${n} days to go, now's a great time to lock it in.` : `.`} Want me to send it over?`;
  }
  if (has("bonfire", "add", "upgrade", "extra", "package")) {
    return `Hi ${name}! Absolutely — we can add that to your ${ctx.packageName || "package"}. I'll put together the updated quote and drop it in your portal so you can review and approve whenever you're ready. 🌾`;
  }
  return `Hi ${name}! Thanks so much for reaching out — great question. Let me confirm the details on our end and get right back to you today. In the meantime, you can always reach us at ${business.phone} if it's time-sensitive. 💛`;
}

const SYSTEM = `You draft replies for the team at ${business.name} responding to a client or guest message.
Voice: warm, gracious, concise — a touch of orchard charm. 2-4 short sentences. At most one tasteful emoji.
Write ONLY the reply body, ready to send. No subject line, no "Draft:" prefix, no placeholders like [name] — use the real context given.
Be accurate: never invent availability, prices, or policies beyond what you're told. If unsure, offer to confirm and follow up.
${KNOWLEDGE}`;

export async function draftReply(message: string, ctx: DraftContext) {
  const { text, mocked } = await generateText({
    system: SYSTEM,
    messages: [{ role: "user", content: `Booking context — ${contextLine(ctx)}\n\nTheir message:\n"""${message}"""\n\nDraft our reply.` }],
    maxTokens: 300,
    mock: () => mockDraft(message, ctx),
  });
  return { draft: text, mocked };
}
