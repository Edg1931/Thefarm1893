/* ============================================================================
   "DESIGN MY DAY" — AI WEDDING VISUALIZER
   Couples choose a season, palette, and style; we return a curated mood board,
   a color story, signature details, and an AI-written vision narrative set at
   The Farm 1893. The narrative uses the pluggable AI core (Claude when keyed).
   The visual layer is Firefly/Canva-ready: swap curatedBoard() for a live image
   generation call to render THEIR wedding in the actual barn/orchard.
   ============================================================================ */

import { generateText } from "./ai";

export const PALETTES: Record<string, { name: string; colors: { hex: string; label: string }[] }> = {
  "blush-sage": { name: "Blush & Sage", colors: [
    { hex: "#e8c4c0", label: "Blush" }, { hex: "#a7b59a", label: "Sage" },
    { hex: "#efe7d9", label: "Linen" }, { hex: "#b18f57", label: "Antique Gold" },
  ]},
  "ivory-gold": { name: "Ivory & Gold", colors: [
    { hex: "#f4ede0", label: "Ivory" }, { hex: "#d9c7a3", label: "Champagne" },
    { hex: "#c9a86a", label: "Gold" }, { hex: "#7c6f57", label: "Bronze" },
  ]},
  "terracotta-rust": { name: "Terracotta & Rust", colors: [
    { hex: "#c07a54", label: "Terracotta" }, { hex: "#a4442f", label: "Rust" },
    { hex: "#e0c9a6", label: "Wheat" }, { hex: "#6b4a34", label: "Cocoa" },
  ]},
  "plum-emerald": { name: "Moody Plum & Emerald", colors: [
    { hex: "#5b3a4b", label: "Plum" }, { hex: "#2f4739", label: "Emerald" },
    { hex: "#b08d57", label: "Brass" }, { hex: "#d8cfc2", label: "Fog" },
  ]},
  "sky-wildflower": { name: "Sky & Wildflower", colors: [
    { hex: "#bcd0d6", label: "Sky" }, { hex: "#d8a7b1", label: "Wildflower" },
    { hex: "#e9e2cf", label: "Cream" }, { hex: "#7c8768", label: "Meadow" },
  ]},
};

const BOARDS: Record<string, string[]> = {
  timeless: [
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=700&q=80",
  ],
  rustic: [
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1470259078422-826894b933ad?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80",
  ],
  modern: [
    "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=700&q=80",
  ],
  boho: [
    "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1470259078422-826894b933ad?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1525772764200-be829a350797?auto=format&fit=crop&w=700&q=80",
  ],
  moody: [
    "https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1460978812857-470ed1c77af0?auto=format&fit=crop&w=700&q=80",
    "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=700&q=80",
  ],
};

const DETAILS: Record<string, string[]> = {
  spring: ["Apple-blossom ceremony arch", "Orchard-picked bud vases", "Soft muslin aisle runner"],
  summer: ["Sun-drenched lawn ceremony", "Citrus & herb welcome bar", "Festoon-lit barn dinner"],
  fall: ["Harvest-table tablescape", "Amber taper candles", "Cider & bonfire send-off"],
  winter: ["Evergreen & brass garlands", "Candlelit barn glow", "Cozy wool-blanket lounge"],
};

export type DesignInput = { season: string; palette: string; style: string };

export async function designMyDay(input: DesignInput) {
  const season = input.season.toLowerCase();
  const style = input.style.toLowerCase();
  const palette = PALETTES[input.palette] ?? PALETTES["blush-sage"];
  const board = BOARDS[style] ?? BOARDS.rustic;
  const details = DETAILS[season] ?? DETAILS.fall;

  const { text, mocked } = await generateText({
    system: `You are the lead wedding designer at The Farm 1893, a historic-orchard barn venue in Berlin Heights, Ohio.
Write a vivid, emotional 3-4 sentence "vision" for the couple's day. Reference the real venue (orchard, restored barn, covered porch, bonfire, farmhouse). Make them feel it. End with a gentle nudge to book a tour.`,
    messages: [{ role: "user", content: `Season: ${season}. Palette: ${palette.name}. Style: ${style}.` }],
    maxTokens: 320,
    mock: () =>
      `Picture a ${season} evening at the farm: you step beneath the heritage orchard in ${palette.name.toLowerCase()} tones, the restored barn glowing just beyond. Your ${style} celebration unfolds effortlessly — ${details[0].toLowerCase()}, laughter drifting across the lawn, and a bonfire waiting as the stars come out. It's warm, it's timeless, and it's unmistakably yours. Come walk the grounds with us and we'll help you see the whole day. 🌾`,
  });

  return {
    vision: text,
    mocked,
    paletteName: palette.name,
    palette: palette.colors,
    moodboard: board,
    signatureDetails: details,
  };
}
