/* ============================================================================
   AI INSIGHTS ENGINE
   Lead scoring, next-best-action, and marketing content generation.
   Heuristics run instantly with zero setup; when ANTHROPIC_API_KEY is present,
   generateMarketingCopy() upgrades to full model output automatically.
   ============================================================================ */

import { generateText } from "./ai";

export type LeadSignals = {
  eventDate?: string | null;
  guestCount?: number | string | null;
  eventType?: string | null;
  message?: string | null;
};

/** Transparent, explainable lead score (0-100) + priority + one-line summary. */
export function scoreLead(s: LeadSignals) {
  let score = 45;
  const reasons: string[] = [];

  const guests = Number(s.guestCount) || 0;
  if (guests >= 150) { score += 20; reasons.push("large guest count"); }
  else if (guests >= 80) { score += 12; reasons.push("solid guest count"); }
  else if (guests > 0) { score += 5; }

  if (s.eventDate) {
    const days = (new Date(s.eventDate).getTime() - Date.now()) / 86_400_000;
    if (days > 30 && days < 400) { score += 18; reasons.push("prime booking window"); }
    else if (days >= 400) { score += 8; reasons.push("early planner"); }
    else if (days >= 0) { score += 4; reasons.push("near-term date"); }
    // Weekend / peak-season bump
    const month = new Date(s.eventDate).getMonth();
    if (month >= 4 && month <= 9) { score += 8; reasons.push("peak season"); }
  }

  const msg = (s.message || "").toLowerCase();
  if (/tour|visit|book|deposit|ready|budget|available/.test(msg)) {
    score += 12; reasons.push("high-intent language");
  }
  if ((s.eventType || "wedding") === "wedding") { score += 6; }

  score = Math.max(5, Math.min(99, score));
  const priority = score >= 78 ? "hot" : score >= 55 ? "warm" : "nurture";
  const summary =
    reasons.length > 0
      ? `${priority === "hot" ? "🔥 Hot lead" : priority === "warm" ? "Warm lead" : "Nurture"} — ${reasons.slice(0, 3).join(", ")}. Recommend follow-up within ${priority === "hot" ? "1 hour" : priority === "warm" ? "24 hours" : "3 days"}.`
      : "New inquiry — send the welcome sequence and offer a tour.";

  return { score, priority, summary, reasons };
}

/* --- Audience personas & goals for targeted ad generation --- */
const PERSONA_ANGLE: Record<string, string> = {
  "budget-couple": "an affordable, all-inclusive weekend that stretches every dollar",
  "luxury-couple": "an elevated, exclusive weekend estate experience",
  "destination-couple": "a weekend where 25 guests stay on-site — no one rushes home",
  "corporate": "a distraction-free retreat with lodging and space to connect",
  "milestone": "a warm, memorable celebration in a one-of-a-kind setting",
  "silo-guest": "a cozy silo getaway in the Ohio countryside near Cedar Point",
};
const GOAL_CTA: Record<string, string> = {
  tour: "Book a private tour →",
  inquiry: "Check your date in 30 seconds →",
  "fill-date": "Grab one of our last open weekends →",
  awareness: "Follow along & fall in love →",
  silos: "Book your silo stay direct & save →",
};

/** Multi-channel, persona-aware marketing copy for the Ad Studio. */
export async function generateMarketingCopy(opts: {
  channel?: string; // instagram | facebook | pinterest | tiktok | x | linkedin | google-ads | email | sms | blog
  kind?: string; // legacy alias for channel
  topic: string;
  profile?: string;
  goal?: string;
  tone?: string;
}) {
  const channel = (opts.channel || opts.kind || "instagram").toLowerCase();
  const tone = opts.tone || "warm, elegant, rustic-luxe";
  const angle = PERSONA_ANGLE[opts.profile ?? ""] || "an all-inclusive weekend wedding in a historic orchard";
  const cta = GOAL_CTA[opts.goal ?? ""] || "Book a private tour →";

  const system = `You are the marketing director for The Farm 1893, a historic-orchard wedding & gathering venue in Berlin Heights, Ohio.
Write a ${channel} ${channel === "google-ads" ? "responsive search ad" : "post"} for this audience: ${angle}.
Tone: ${tone}. Topic/angle: ${opts.topic}. Goal: ${opts.goal ?? "drive tour bookings"}.
Follow ${channel} best practices (length, hashtags, format). Include a clear call to action and, where natural, tasteful emojis.`;

  const tags = "#TheFarm1893 #OhioWeddingVenue #BarnWedding #OrchardWedding #RusticElegance";
  const mock = () => {
    switch (channel) {
      case "google-ads":
        return `Headlines:\n• Your Whole Wedding Weekend\n• All-Inclusive Ohio Barn Venue\n• Sleeps 25 · One Magical Farm\n\nDescriptions:\n• Ceremony in the orchard, dinner in the barn, 25 guests on-site. ${cta}\n• ${angle[0].toUpperCase() + angle.slice(1)}. Tours filling fast for 2026.`;
      case "pinterest":
        return `Title: ${opts.topic} at an Ohio Orchard Barn Venue\n\nDescription: Dreaming of ${angle}? The Farm 1893 in Berlin Heights, OH blends a restored barn, heritage orchard, and on-site lodging for 25. Save this for your planning board 📌🌾\n\n${tags} #WeddingInspiration`;
      case "tiktok":
        return `HOOK: "POV: you never have to rush your wedding day." 🌾\n\n• Friday: rehearsal + bonfire\n• Saturday: orchard ceremony at golden hour\n• Sunday: farewell brunch, no goodbyes at midnight\n\nThat's ${angle}. ${cta}\n\n${tags} #WeddingTok`;
      case "x":
        return `Golden hour in the orchard hits different. 🌾\n\n${angle}. A few 2026 weekends left. ${cta}\n\n${tags}`;
      case "linkedin":
        return `Planning an off-site or team retreat? 🌾\n\nThe Farm 1893 offers ${angle} — a restored barn, 40 private acres, and on-site lodging just outside Sandusky. Room to connect, unplug, and get real work done.\n\n${cta}`;
      case "email":
        return `Subject: Your date at The Farm 1893 is closer than you think 🌾\n\nHi {{first_name}},\n\nImagine ${angle} — your closest people gathered under the orchard, a bonfire as the sun goes down, and no one rushing home.\n\nA few 2026 weekends are still open, and they're going quickly.\n\n${cta}\n\nWarmly,\nThe Farm 1893 Team`;
      case "sms":
        return `Hi {{first}}! It's The Farm 1893 🌾 A couple of 2026 weekends just opened up — want us to hold a private tour for you? ${cta}`;
      case "blog":
        return `# ${opts.topic}\n\nMost couples don't realize how much of their wedding day is spent watching the clock. At The Farm 1893 we asked: what if you never had to rush? Here's how ${angle} unfolds, from Friday's bonfire to Sunday's farewell brunch…`;
      default: // instagram / facebook
        return `✨ Golden hour in the orchard hits different. ✨\n\nThere's a moment — just after "I do" — when the light slips through the apple trees and everyone you love is right there. That's ${angle} at The Farm 1893. 🌾🍎\n\n📍 Berlin Heights, OH · A few 2026 weekends left\n💌 ${cta}\n\n${tags}`;
    }
  };

  const { text, mocked } = await generateText({
    system,
    messages: [{ role: "user", content: `Write a ${channel} post. Angle: ${opts.topic}. Audience: ${angle}. Goal: ${opts.goal ?? "tour bookings"}.` }],
    maxTokens: 650,
    mock,
  });
  return { content: text, mocked };
}
