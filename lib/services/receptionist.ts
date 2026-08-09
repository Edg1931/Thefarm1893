/* ============================================================================
   AI RECEPTIONIST ("Rosie") — brain for the web chat + (future) phone line.

   Two paths, and the difference matters:
   · ANTHROPIC_API_KEY set  → the real model answers, with full conversation
                              context. This is the intended experience.
   · no key                 → the deterministic fallback below.

   The fallback used to keyword-match ONLY the visitor's most recent message
   and had no memory at all, so answering its question could re-trigger the
   same question. Asked "what days in October 2027 are available", it asked for
   a date and guest count; told "290 people October 18th 2027", the word "2027"
   matched the same branch and it asked for the date and guest count AGAIN.

   It now reads the whole thread, remembers what the visitor has already given,
   never asks twice, and never repeats its own previous message.
   ============================================================================ */

import { generateText, type ChatMessage } from "./ai";
import { business, packages, faqs } from "@/lib/content";
import { isPlaceholder } from "@/lib/content-flags";

/* --- venue facts, in one place so both paths agree ------------------------ */
const SEATED_MAX = 200;
const CEREMONY_MAX = 220;

/** Only offer the phone number if it's a real one. */
const callLine = () =>
  isPlaceholder("phone") ? "" : ` Or call us anytime at ${business.phone}.`;

const KNOWLEDGE = `
VENUE: ${business.name} — ${business.tagline}
LOCATION: ${business.address}
STORY: A historic 1893 fruit farm reborn as an all-in-one wedding & gathering venue.
KEY FACTS:
- All-in-one: rehearsal dinner, ceremony, cocktail hour, reception, and overnight stay on ONE property.
- Ceremony options: heritage orchard lawn, covered porch (rain-or-shine), or inside the barn.
- The Barn seats up to ${SEATED_MAX} for dinner; orchard ceremonies up to ~${CEREMONY_MAX}.
- The farmhouse sleeps up to 25 guests overnight.
- Signature "Weekend" package = exclusive access Friday 3PM to Sunday 11AM.
PACKAGES: ${packages.map((p) => `${p.name} (${p.price}, ${p.cadence}): ${p.summary}`).join(" | ")}
FAQ: ${faqs.map((f) => `Q:${f.q} A:${f.a}`).join(" | ")}
`;

const SYSTEM = `You are Rosie, the warm, concise AI concierge for ${business.name}.
Goal: help couples fall in love with the venue and capture their inquiry (name, date, guest count, email/phone).
Voice: gracious, genuine, a touch of orchard charm. Keep replies to 2-4 short sentences. Use at most one tasteful emoji.

CRITICAL CONVERSATION RULES:
- Read the whole conversation before replying. NEVER ask for something the visitor has already told you.
- If they have given a date or a guest count, acknowledge it back to them by name/number before anything else.
- Never repeat a question you have already asked. If you are unsure what to say next, move the conversation forward instead of repeating.
- If a party size exceeds ${SEATED_MAX} seated indoors or ~${CEREMONY_MAX} for a ceremony, say so honestly and offer options (tented lawn, ceremony outdoors with a split reception). Do not pretend it fits.
- Never invent exact availability — offer to check and confirm with the team.
${isPlaceholder("phone") ? "- Do NOT give out a phone number; direct people to the inquiry form instead." : ""}

Here is everything you know:
${KNOWLEDGE}`;

/* ---------------------------------------------------------------------------
   FALLBACK ENGINE — stateful enough to hold a real conversation.
   --------------------------------------------------------------------------- */

type Known = { date?: string; guests?: number; email?: string; name?: string };

const MONTHS = "january|february|march|april|may|june|july|august|september|october|november|december";

/** Everything the visitor has told us, gathered across the entire thread. */
function extract(messages: ChatMessage[]): Known {
  const userMsgs = messages.filter((m) => m.role === "user").map((m) => m.content);
  const said = userMsgs.join("  ");
  const k: Known = {};
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Newest first: if they said "October 2027" and later "October 18th 2027",
  // the specific day wins over the vaguer timeframe mentioned earlier.
  //
  // The day group is (\d{1,2})(?!\d) so a bare year can never be mistaken for
  // a day — without that guard, "October 2027" parsed as "October 20".
  for (const msg of [...userMsgs].reverse()) {
    const t = msg.toLowerCase();
    const withDay = t.match(new RegExp(`\\b(${MONTHS})\\w*\\.?\\s+(\\d{1,2})(?!\\d)(?:st|nd|rd|th)?(?:,?\\s*(\\d{4}))?`, "i"))
      ?? null;
    const dayFirst = t.match(new RegExp(`\\b(\\d{1,2})(?!\\d)(?:st|nd|rd|th)?\\s+(${MONTHS})\\w*(?:,?\\s*(\\d{4}))?`, "i"));
    const numeric = msg.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
    const monthYear = t.match(new RegExp(`\\b(${MONTHS})\\w*\\s+(\\d{4})\\b`, "i"));

    if (withDay) { k.date = `${cap(withDay[1])} ${withDay[2]}${withDay[3] ? `, ${withDay[3]}` : ""}`; break; }
    if (dayFirst) { k.date = `${cap(dayFirst[2])} ${dayFirst[1]}${dayFirst[3] ? `, ${dayFirst[3]}` : ""}`; break; }
    if (numeric) { k.date = numeric[0]; break; }
    if (monthYear) { k.date = `${cap(monthYear[1])} ${monthYear[2]}`; break; }
  }

  // Guest count. Ranges are normal in real enquiries ("180 to 200"), so take
  // the upper bound — it's the number that decides whether they fit.
  const lower = said.toLowerCase();
  const range = (m: RegExpMatchArray | null) =>
    m ? Math.max(parseInt(m[1], 10), m[2] ? parseInt(m[2], 10) : 0) : undefined;

  const g1 = range(lower.match(/\b(\d{2,4})\s*(?:to|-|–|—)?\s*(\d{2,4})?\s*(?:people|guests?|pax|attendees|heads)\b/));
  const g2 = range(lower.match(/\b(?:about|around|roughly|approx\.?|~)?\s*(\d{2,4})\s*(?:to|-|–|—)?\s*(\d{2,4})?\s*(?:of us|in total|total)\b/));

  // A bare number is an answer when we just asked the question. Rosie asked
  // "roughly how many guests", the visitor replied "180 to 200", and the old
  // parser ignored it for lacking the word "guests" — so she asked again.
  let g3: number | undefined;
  const lastUser = userMsgs[userMsgs.length - 1] ?? "";
  const lastAsk = [...messages].reverse().find((m) => m.role === "assistant")?.content.toLowerCase() ?? "";
  if (/how many guests|how many people|guest count/.test(lastAsk)) {
    g3 = range(lastUser.trim().match(/^\s*(?:about|around|roughly|approx\.?|~)?\s*(\d{2,4})\s*(?:to|-|–|—|or)?\s*(\d{2,4})?\s*$/i));
  }

  const guests = g1 ?? g2 ?? g3;
  if (guests) k.guests = guests;

  const em = said.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  if (em) k.email = em[0];

  const nm = said.match(/\b(?:i'?m|my name is|this is|it'?s)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (nm) k.name = nm[1];

  return k;
}

/** Honest answer when a party is larger than the barn seats. */
function capacityNote(guests: number): string | null {
  if (guests <= SEATED_MAX) return null;
  if (guests <= CEREMONY_MAX) {
    return `${guests} works beautifully for a ceremony on the orchard lawn — seated dinner inside the barn tops out at ${SEATED_MAX}, so we'd look at a tented or partly-outdoor reception for the rest.`;
  }
  return `I want to be straight with you: ${guests} is above our indoor seated capacity of ${SEATED_MAX}, and the orchard ceremony holds about ${CEREMONY_MAX}. Couples at your size usually add a tent on the lawn — our team can price that out properly.`;
}

function topicAnswer(last: string): string | null {
  const has = (...k: string[]) => k.some((w) => last.includes(w));
  if (has("price", "cost", "how much", "pricing", "package", "included"))
    return `Our all-inclusive Weekend package (Fri 3PM–Sun 11AM, exclusive use of the farm plus the farmhouse for 25 guests) starts at ${packages[1].price}, and single-day Gatherings begin at ${packages[0].price}.`;
  if (has("capacity", "how many can", "seat", "fit"))
    return `The Barn seats up to ${SEATED_MAX} for dinner, and the orchard lawn holds ceremonies up to about ${CEREMONY_MAX}. The farmhouse sleeps 25 overnight.`;
  if (has("stay", "overnight", "sleep", "accommodation", "lodging", "farmhouse"))
    return "Our on-site farmhouse sleeps up to 25, so your wedding party can stay the whole weekend — no rushing home.";
  if (has("rain", "weather", "indoor", "backup"))
    return "You're covered — literally. The wraparound covered porch is a rain-or-shine ceremony spot, and the barn is climate-controlled for any season.";
  if (has("cater", "food", "bar", "alcohol", "vendor"))
    return "You're welcome to bring an outside caterer, though our preferred list keeps things simplest — they know the kitchen and the timing here.";
  if (has("tour", "visit", "walk through", "see it"))
    return "Tours are the best way to feel the place — we can usually find a slot within a week or two.";
  return null;
}

function mockReply(messages: ChatMessage[]): string {
  const k = extract(messages);
  // What did THIS turn actually add? Acknowledging a detail once is warm;
  // repeating it every turn is what made the old bot feel like a machine.
  const prior = extract(messages.slice(0, messages.map((m) => m.role).lastIndexOf("user")));
  const newDate = k.date && k.date !== prior.date;
  const newGuests = k.guests && k.guests !== prior.guests;

  const last = messages.filter((m) => m.role === "user").pop()?.content.toLowerCase() ?? "";
  const priorAssistant = messages.filter((m) => m.role === "assistant").map((m) => m.content);
  const said = (s: string) => priorAssistant.some((p) => p.includes(s.slice(0, 40)));

  const parts: string[] = [];

  // If they've flagged that we repeated ourselves, own it and show our working.
  if (/just (told|said)|already (told|said)|you asked|repeat|asked me/i.test(last)) {
    const got = [k.date, k.guests && `${k.guests} guests`].filter(Boolean).join(" for ");
    parts.push(got ? `You did — sorry about that. I have ${got}.` : "You're right, sorry about that.");
  } else if (/^(hi|hey|hello|yo)\b/.test(last) && !k.date && !k.guests) {
    parts.push("Hi! So glad you're here \u{1F33F} I can check a date, talk pricing, or set up a tour.");
  }

  // Acknowledge only what's new this turn.
  if (newDate && newGuests) parts.push(`${k.date} with about ${k.guests} guests — lovely.`);
  else if (newDate) parts.push(`${k.date} — a beautiful time of year here.`);
  else if (newGuests) parts.push(`About ${k.guests} guests — good to know.`);

  // Answer what they actually asked.
  const topic = topicAnswer(last);
  if (topic && !said(topic)) parts.push(topic);
  else if (!topic && /\?|\b(do|does|can|is|are|will|what|how|when|where|any)\b/.test(last) && !parts.length) {
    // A question we have no canned answer for. Say so rather than steamrolling
    // it with the next funnel question — being ignored is what makes a bot
    // feel broken.
    parts.push("That's a good question and I want to get it exactly right — I'll have the team confirm that for you.");
  }

  // Be honest about size — but say it once, not on every turn.
  if (k.guests) {
    const note = capacityNote(k.guests);
    if (note && !said(note)) parts.push(note);
  }

  // Ask only for the ONE next thing we genuinely still need.
  if (!k.date) parts.push("What date do you have in mind?");
  else if (!k.guests) parts.push("Roughly how many guests are you expecting?");
  else if (!k.email) {
    const askEmail = `I can't confirm a specific date from here, but I'll have the team check ${k.date} and come straight back to you — what's the best email?${callLine()}`;
    parts.push(said(askEmail) ? "What's the best email to reach you on?" : askEmail);
  } else {
    parts.push(`Perfect — I've got everything I need. The team will confirm ${k.date} and follow up at ${k.email} shortly.${callLine()}`);
  }

  const reply = parts.join(" ").trim();
  // Last-ditch guard: never send the exact message we just sent.
  if (priorAssistant.some((p) => p.trim() === reply)) {
    return k.email
      ? "We've got your details and the team is on it — anything else I can answer in the meantime?"
      : "Happy to help with anything else — pricing, the farmhouse, or what a weekend here actually looks like.";
  }
  return reply;
}

export async function receptionistReply(messages: ChatMessage[]) {
  const { text, mocked } = await generateText({
    system: SYSTEM,
    // Enough history for the model to hold the thread, not just the last turn.
    messages: messages.slice(-16),
    maxTokens: 400,
    mock: () => mockReply(messages),
  });
  return { reply: text, mocked };
}
