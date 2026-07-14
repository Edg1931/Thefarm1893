/* ============================================================================
   "WHAT'S YOUR WEDDING STYLE?" QUIZ
   A shareable, top-of-funnel quiz that ends in a personalized Design-My-Day
   result (style + palette + season) and captures a lead. Each answer tags a
   style and/or palette; we tally and pick the winners, then hand off to the
   real /api/design engine for the mood board.
   ============================================================================ */

export type Choice = {
  label: string;
  style?: string; // Timeless | Rustic | Modern | Boho | Moody
  palette?: string; // design.ts palette key
  season?: string; // Spring | Summer | Fall | Winter
};

export type Question = { q: string; choices: Choice[] };

export const quiz: Question[] = [
  {
    q: "Where do you picture saying “I do”?",
    choices: [
      { label: "Under the heritage orchard at golden hour", style: "Rustic", palette: "terracotta-sage" },
      { label: "Inside a candlelit barn", style: "Moody", palette: "emerald-gold" },
      { label: "A garden overflowing with blooms", style: "Boho", palette: "blush-sage" },
      { label: "Somewhere clean, airy, and modern", style: "Modern", palette: "dusty-blue" },
    ],
  },
  {
    q: "Which color makes your heart skip?",
    choices: [
      { label: "Soft blush & sage", palette: "blush-sage" },
      { label: "Warm terracotta & clay", palette: "terracotta-sage" },
      { label: "Rich emerald & gold", palette: "emerald-gold" },
      { label: "Dusty blue & navy", palette: "dusty-blue" },
    ],
  },
  {
    q: "Your wedding, in three words?",
    choices: [
      { label: "Intimate & romantic", style: "Timeless", palette: "mauve-champagne" },
      { label: "Grand & elegant", style: "Timeless", palette: "ivory-gold" },
      { label: "Relaxed & free-spirited", style: "Boho", palette: "blush-sage" },
      { label: "Moody & dramatic", style: "Moody", palette: "emerald-gold" },
    ],
  },
  {
    q: "Which season is calling you?",
    choices: [
      { label: "Spring — blossoms & fresh starts", season: "Spring", palette: "blush-sage" },
      { label: "Summer — long golden evenings", season: "Summer", palette: "ivory-gold" },
      { label: "Fall — harvest & warm tones", season: "Fall", palette: "terracotta-sage" },
      { label: "Winter — candlelight & cozy", season: "Winter", palette: "emerald-gold" },
    ],
  },
  {
    q: "Pick your flowers.",
    choices: [
      { label: "Wildflowers & greenery", style: "Boho", palette: "blush-sage" },
      { label: "Garden roses & peonies", style: "Timeless", palette: "mauve-champagne" },
      { label: "Dried florals & pampas", style: "Rustic", palette: "terracotta-sage" },
      { label: "Dark, dramatic blooms", style: "Moody", palette: "emerald-gold" },
    ],
  },
];

const STYLE_NAMES = ["Timeless", "Rustic", "Modern", "Boho", "Moody"];

export function scoreQuiz(answers: Choice[]) {
  const styleCount: Record<string, number> = {};
  const paletteCount: Record<string, number> = {};
  let season = "Fall";

  for (const a of answers) {
    if (a.style) styleCount[a.style] = (styleCount[a.style] ?? 0) + 1;
    if (a.palette) paletteCount[a.palette] = (paletteCount[a.palette] ?? 0) + 1;
    if (a.season) season = a.season;
  }

  const style = topKey(styleCount, STYLE_NAMES[0]);
  const palette = topKey(paletteCount, "blush-sage");
  return { style, palette, season };
}

function topKey(counts: Record<string, number>, fallback: string) {
  let best = fallback, max = 0;
  for (const [k, v] of Object.entries(counts)) if (v > max) { max = v; best = k; }
  return best;
}
