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

/** Marketing copy generator for the AI Marketing Studio. */
export async function generateMarketingCopy(opts: {
  kind: "instagram" | "email" | "ad" | "blog";
  topic: string;
  tone?: string;
}) {
  const tone = opts.tone || "warm, elegant, rustic-luxe";
  const system = `You are the marketing director for The Farm 1893, a historic-orchard wedding venue in Berlin Heights, Ohio.
Write ${opts.kind} content that is ${tone}, emotionally resonant, and drives tour bookings. Include a clear call to action.`;

  const mock = () => {
    const map: Record<string, string> = {
      instagram: `✨ Golden hour in the orchard hits different. ✨\n\nThere's a moment — just after "I do," when the light slips through the apple trees and everyone you love is standing right there — that you'll remember forever. That's the magic of ${opts.topic} at The Farm 1893. 🌾🍎\n\n📍 Berlin Heights, OH · Weekends still open for 2026\n💌 Tap the link to check your date.\n\n#TheFarm1893 #OhioWeddingVenue #BarnWedding #OrchardWedding #RusticElegance`,
      email: `Subject: Your date at The Farm 1893 is closer than you think 🌾\n\nHi {{first_name}},\n\nImagine it: your closest people, gathered under our heritage orchard, a bonfire crackling as the sun goes down — and no one rushing home, because the whole weekend is yours.\n\nWe still have a few ${opts.topic} weekends open for 2026, and they're going quickly. Would you like us to hold a private tour for you this month?\n\n→ Check your date in 30 seconds\n\nWarmly,\nThe Farm 1893 Team`,
      ad: `Headline: Your Whole Wedding Weekend, One Magical Farm\nBody: Ceremony under the orchard. Dinner in the restored barn. 25 guests staying on-site. ${opts.topic} at The Farm 1893 — Ohio's all-in-one wedding venue. Tours filling fast for 2026.\nCTA: Check Your Date →`,
      blog: `# ${opts.topic}: Why an All-Inclusive Weekend Venue Changes Everything\n\nMost couples don't realize how much of their wedding day is spent watching the clock. At The Farm 1893, we designed the entire experience around one radical idea: what if you never had to rush?\n\nFrom the Friday rehearsal dinner to the Sunday farewell brunch, here's how a weekend at the farm unfolds…`,
    };
    return map[opts.kind] ?? map.instagram;
  };

  const { text, mocked } = await generateText({
    system,
    messages: [{ role: "user", content: `Write a ${opts.kind} post about: ${opts.topic}` }],
    maxTokens: 600,
    mock,
  });
  return { content: text, mocked };
}
