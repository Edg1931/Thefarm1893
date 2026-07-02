/* ============================================================================
   "DESIGN MY DAY" — AI WEDDING VISUALIZER
   Couples choose a season, palette, and style; we return a mood board, a color
   story, signature details, and an AI-written vision set at The Farm 1893.
   - Narrative: pluggable AI text (Claude when keyed).
   - Imagery: real AI-generated photos when an image key is set (image.ts);
     otherwise a curated set that varies by PALETTE, season, AND style, with the
     chosen palette washed over the board so it reads in the couple's colors.
   ============================================================================ */

import { generateText } from "./ai";
import { generateImages } from "./image";

// The six most-loved wedding palettes, hand-tuned for The Farm 1893.
export const PALETTES: Record<string, { name: string; mood: string; colors: { hex: string; label: string }[] }> = {
  "blush-sage": { name: "Blush & Sage", mood: "soft, romantic, garden-fresh", colors: [
    { hex: "#e7c6c4", label: "Blush" }, { hex: "#a6b69a", label: "Sage" },
    { hex: "#ebdfcc", label: "Champagne" }, { hex: "#b6935c", label: "Antique Gold" },
  ]},
  "ivory-gold": { name: "Ivory & Gold", mood: "elegant, timeless, candlelit", colors: [
    { hex: "#f4ede1", label: "Ivory" }, { hex: "#e0cda6", label: "Champagne" },
    { hex: "#c6a15b", label: "Gold" }, { hex: "#7c6b4c", label: "Bronze" },
  ]},
  "dusty-blue": { name: "Dusty Blue & Navy", mood: "refined, classic, serene", colors: [
    { hex: "#9db4c4", label: "Dusty Blue" }, { hex: "#33465b", label: "Navy" },
    { hex: "#ede6d8", label: "Cream" }, { hex: "#aeb6a6", label: "Silver Sage" },
  ]},
  "terracotta-sage": { name: "Terracotta & Sage", mood: "warm, earthy, organic", colors: [
    { hex: "#c07a54", label: "Terracotta" }, { hex: "#a4553a", label: "Sienna" },
    { hex: "#97a585", label: "Sage" }, { hex: "#e3cda9", label: "Wheat" },
  ]},
  "emerald-gold": { name: "Emerald & Gold", mood: "moody, opulent, jewel-toned", colors: [
    { hex: "#2f5044", label: "Emerald" }, { hex: "#1e3a30", label: "Forest" },
    { hex: "#c6a15b", label: "Gold" }, { hex: "#e3d6bc", label: "Champagne" },
  ]},
  "mauve-champagne": { name: "Mauve & Champagne", mood: "modern, romantic, understated", colors: [
    { hex: "#b491a0", label: "Mauve" }, { hex: "#c9a2a6", label: "Dusty Rose" },
    { hex: "#e7d8c3", label: "Champagne" }, { hex: "#8c8177", label: "Taupe" },
  ]},
};

/** Distinct photo pools per palette (leaning toward each palette's hues). */
const POOLS: Record<string, string[]> = {
  "blush-sage": [
    "photo-1519225421980-715cb0215aed", "photo-1465495976277-4387d4b0b4c6",
    "photo-1519378058457-4c29a0a2efac", "photo-1522673607200-164d1b6ce486",
    "photo-1502635385003-ee1e6a1a742d", "photo-1470259078422-826894b933ad",
  ],
  "ivory-gold": [
    "photo-1519741497674-611481863552", "photo-1511285560929-80b456fea0bc",
    "photo-1525258946800-98cfd641d0de", "photo-1487530811176-3780de880c2d",
    "photo-1511795409834-ef04bbd61622", "photo-1519671482749-fd09be7ccebf",
  ],
  "dusty-blue": [
    "photo-1470259078422-826894b933ad", "photo-1487530811176-3780de880c2d",
    "photo-1519671482749-fd09be7ccebf", "photo-1522673607200-164d1b6ce486",
    "photo-1465495976277-4387d4b0b4c6", "photo-1519225421980-715cb0215aed",
  ],
  "terracotta-sage": [
    "photo-1464366400600-7168b8af9bc3", "photo-1478146896981-b80fe463b330",
    "photo-1525772764200-be829a350797", "photo-1460978812857-470ed1c77af0",
    "photo-1519378058457-4c29a0a2efac", "photo-1522413452208-996ff3f3e740",
  ],
  "emerald-gold": [
    "photo-1522413452208-996ff3f3e740", "photo-1460978812857-470ed1c77af0",
    "photo-1519741497674-611481863552", "photo-1478146896981-b80fe463b330",
    "photo-1525258946800-98cfd641d0de", "photo-1511285560929-80b456fea0bc",
  ],
  "mauve-champagne": [
    "photo-1519378058457-4c29a0a2efac", "photo-1502635385003-ee1e6a1a742d",
    "photo-1465495976277-4387d4b0b4c6", "photo-1519225421980-715cb0215aed",
    "photo-1511795409834-ef04bbd61622", "photo-1522673607200-164d1b6ce486",
  ],
};

const SEASONS = ["spring", "summer", "fall", "winter"];
const STYLES = ["timeless", "rustic", "modern", "boho", "moody"];

const DETAILS: Record<string, string[]> = {
  spring: ["Apple-blossom ceremony arch", "Orchard-picked bud vases", "Soft muslin aisle runner"],
  summer: ["Sun-drenched lawn ceremony", "Citrus & herb welcome bar", "Festoon-lit barn dinner"],
  fall: ["Harvest-table tablescape", "Amber taper candles", "Cider & bonfire send-off"],
  winter: ["Evergreen & brass garlands", "Candlelit barn glow", "Cozy wool-blanket lounge"],
};

/** Curated board that visibly changes with palette, season, and style. */
function curatedBoard(paletteKey: string, season: string, style: string): string[] {
  const pool = POOLS[paletteKey] ?? POOLS["blush-sage"];
  const s = Math.max(0, SEASONS.indexOf(season));
  const st = Math.max(0, STYLES.indexOf(style));
  const start = (s * 2 + st) % pool.length;
  return Array.from({ length: 4 }, (_, i) =>
    `https://images.unsplash.com/${pool[(start + i) % pool.length]}?auto=format&fit=crop&w=800&q=80`
  );
}

export type DesignInput = { season: string; palette: string; style: string };

export async function designMyDay(input: DesignInput) {
  const season = input.season.toLowerCase();
  const style = input.style.toLowerCase();
  const paletteKey = input.palette;
  const palette = PALETTES[paletteKey] ?? PALETTES["blush-sage"];
  const details = DETAILS[season] ?? DETAILS.fall;

  // 1) Try real AI image generation in the exact palette; else curated + wash.
  const imgPrompt = `Editorial wedding photography at a restored 1893 barn and apple orchard venue in ${season}. ${style} style, ${palette.mood} mood. Color palette strictly ${palette.name}: ${palette.colors.map((c) => c.label).join(", ")} (${palette.colors.map((c) => c.hex).join(", ")}). Florals, table settings, and decor in these exact colors. Natural light, romantic, true-to-life.`;
  const aiImages = await generateImages(imgPrompt, 4);
  const moodboard = aiImages ?? curatedBoard(paletteKey, season, style);

  // 2) Vision narrative.
  const { text, mocked } = await generateText({
    system: `You are the lead wedding designer at The Farm 1893, a historic-orchard barn venue in Berlin Heights, Ohio.
Write a vivid, emotional 3-4 sentence "vision" for the couple's day in their exact palette. Reference the real venue (orchard, restored barn, covered porch, bonfire, farmhouse) and name their colors. End with a gentle nudge to book a tour.`,
    messages: [{ role: "user", content: `Season: ${season}. Palette: ${palette.name} (${palette.colors.map((c) => c.label).join(", ")}). Style: ${style} (${palette.mood}).` }],
    maxTokens: 320,
    mock: () =>
      `Picture a ${season} evening at the farm dressed in ${palette.name.toLowerCase()} — ${palette.colors[0].label.toLowerCase()} and ${palette.colors[1].label.toLowerCase()} threaded through the orchard as the restored barn glows just beyond. Your ${style} celebration feels ${palette.mood}: ${details[0].toLowerCase()}, laughter across the lawn, a bonfire waiting as the stars come out. Every detail, from the linens to the blooms, carries your colors. Come walk the grounds with us and we'll help you see the whole day. 🌾`,
  });

  return {
    vision: text,
    mocked,
    aiGenerated: Boolean(aiImages),
    paletteKey,
    paletteName: palette.name,
    palette: palette.colors,
    moodboard,
    signatureDetails: details,
  };
}
