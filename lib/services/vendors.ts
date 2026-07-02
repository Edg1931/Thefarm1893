/* ============================================================================
   AI VENDOR MATCHMAKER
   Couples describe their vibe + budget; we score the vendor roster and return a
   curated "dream team" with an AI-written rationale. Pluggable: the narrative
   upgrades to full Claude output when a key is present.
   ============================================================================ */

import { generateText } from "./ai";
import { vendors, vendorCategories, type Vendor } from "@/lib/content";

const bandValue = { "$": 1, "$$": 2, "$$$": 3 } as const;

export type MatchInput = {
  budget?: "$" | "$$" | "$$$";
  categories?: string[]; // category slugs; empty = all
  style?: string;
};

export function matchVendors(input: MatchInput) {
  const wanted = input.categories?.length ? input.categories : vendorCategories.map((c) => c.slug);
  const budget = input.budget ? bandValue[input.budget] : 3;

  // One best pick per requested category, scored by fit.
  const picks: Vendor[] = [];
  for (const cat of wanted) {
    const inCat = vendors.filter((v) => v.category === cat);
    if (!inCat.length) continue;
    const best = [...inCat].sort((a, b) => score(b, budget) - score(a, budget))[0];
    picks.push(best);
  }
  return picks;
}

function score(v: Vendor, budget: number) {
  let s = v.rating * 10 + v.bookedWithUs; // quality + proven-here trust
  if (v.tier === "preferred") s += 15;
  else if (v.tier === "featured") s += 7;
  if (bandValue[v.priceBand] <= budget) s += 12; // in budget
  else s -= (bandValue[v.priceBand] - budget) * 8;
  return s;
}

export async function matchWithRationale(input: MatchInput) {
  const picks = matchVendors(input);
  const list = picks.map((p) => `${p.name} (${categoryName(p.category)}, ${p.priceBand})`).join(", ");

  const { text, mocked } = await generateText({
    system: `You are the wedding concierge for The Farm 1893. In 2-3 warm sentences, explain why this curated vendor team is a great fit for the couple's vibe. Be specific and reassuring; mention they're all proven at our venue.`,
    messages: [{ role: "user", content: `Vibe: ${input.style || "timeless & rustic"}. Budget: ${input.budget || "$$"}. Team: ${list}.` }],
    maxTokens: 250,
    mock: () =>
      `We hand-picked this team for a ${input.style || "timeless, rustic-elegant"} celebration — every one has worked weddings here at the farm and knows our light, our barn, and our orchard by heart. They fit your budget beautifully and coordinate seamlessly, so your planning feels effortless. Tap any partner to request them and we'll make the introduction. 🌾`,
  });

  return { picks, rationale: text, mocked };
}

function categoryName(slug: string) {
  return vendorCategories.find((c) => c.slug === slug)?.name ?? slug;
}
