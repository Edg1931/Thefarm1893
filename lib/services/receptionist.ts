/* ============================================================================
   AI RECEPTIONIST ("Rosie") — brain for the web chat + (future) phone line.
   Uses the pluggable AI core. Ships with a smart keyword-driven mock so it
   answers real questions about The Farm 1893 with no API key.
   ============================================================================ */

import { generateText, type ChatMessage } from "./ai";
import { business, packages, faqs } from "@/lib/content";

const KNOWLEDGE = `
VENUE: ${business.name} — ${business.tagline}
LOCATION: ${business.address}
PHONE: ${business.phone}
STORY: A historic 1893 fruit farm reborn as an all-in-one wedding & gathering venue.
KEY FACTS:
- All-in-one: rehearsal dinner, ceremony, cocktail hour, reception, and overnight stay on ONE property.
- Ceremony options: heritage orchard lawn, covered porch (rain-or-shine), or inside the barn.
- The Barn seats up to 200 for dinner; orchard ceremonies up to ~220.
- The farmhouse sleeps up to 25 guests overnight.
- Signature "Weekend" package = exclusive access Friday 3PM to Sunday 11AM.
PACKAGES: ${packages.map((p) => `${p.name} (${p.price}, ${p.cadence}): ${p.summary}`).join(" | ")}
FAQ: ${faqs.map((f) => `Q:${f.q} A:${f.a}`).join(" | ")}
`;

const SYSTEM = `You are Rosie, the warm, concise AI concierge for ${business.name}.
Goal: help couples fall in love with the venue and capture their inquiry (name, date, guest count, email/phone).
Voice: gracious, genuine, a touch of orchard charm. Keep replies to 2-4 short sentences. Use at most one tasteful emoji.
Always move toward booking a tour or checking a date. If asked something you don't know, offer to have the team follow up and ask for their contact info.
Never invent exact availability — offer to check and confirm. Here is everything you know:
${KNOWLEDGE}`;

/** Deterministic, genuinely-helpful fallback when no API key is present. */
function mockReply(messages: ChatMessage[]): string {
  const last = messages.filter((m) => m.role === "user").pop()?.content.toLowerCase() ?? "";
  const has = (...k: string[]) => k.some((w) => last.includes(w));

  if (has("price", "cost", "how much", "pricing", "package", "included")) {
    return `Great question! Our all-inclusive Weekend package (Fri 3PM–Sun 11AM, exclusive use of the whole farm plus the farmhouse for 25 guests) starts at ${packages[1].price}. Single-day Gatherings begin at ${packages[0].price}. Want me to email you the full brochure? 🌾`;
  }
  if (has("available", "availability", "date", "booked", "open", "2026", "2027")) {
    return "I'd love to check that date for you! Peak Saturdays book 12–18 months out, but I can confirm right away — what's the date you have in mind, and roughly how many guests?";
  }
  if (has("guest", "capacity", "how many", "people", "seat")) {
    return "The Barn seats up to 200 for dinner, and our orchard lawn holds ceremonies up to about 220. The farmhouse also sleeps 25 of your closest people overnight. How many guests are you expecting?";
  }
  if (has("stay", "overnight", "sleep", "accommodation", "lodging", "farmhouse")) {
    return "Yes! Our on-site farmhouse sleeps up to 25 guests, so your wedding party can stay the whole weekend — no rushing home. Would you like to see the suites on a tour?";
  }
  if (has("rain", "weather", "indoor", "backup")) {
    return "You're fully covered — literally! The wraparound covered porch is a beautiful rain-or-shine ceremony spot, and the barn is climate-controlled for any season. Shall I check your date?";
  }
  if (has("tour", "visit", "see", "book", "schedule")) {
    return `I'd be delighted to set that up! Tours are the best way to feel the magic. What's your name and the best email or phone to reach you? You can also call us anytime at ${business.phone}. 💌`;
  }
  if (has("hi", "hello", "hey", "help")) {
    return "Hi! So glad you're here 🌿 I can check a date, walk you through pricing, or help you plan a tour of the farm. What would you love to know first?";
  }
  return `That's a wonderful question — let me make sure you get the perfect answer. Could you share your name and email, and I'll have our venue team follow up personally? Or call us anytime at ${business.phone}. In the meantime, is there a date you're hoping for?`;
}

export async function receptionistReply(messages: ChatMessage[]) {
  const { text, mocked } = await generateText({
    system: SYSTEM,
    messages: messages.slice(-10),
    maxTokens: 400,
    mock: () => mockReply(messages),
  });
  return { reply: text, mocked };
}
