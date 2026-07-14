/* ============================================================================
   REAL WEDDINGS — featured celebrations at The Farm 1893.
   SEO gold (every story is an indexable, image-rich page) and the strongest
   social proof there is. Demo data uses placeholder imagery.
   ============================================================================ */

export type RealWedding = {
  slug: string;
  couple: string;
  date: string;
  season: string;
  palette: string;
  guests: number;
  hero: string;
  quote: string;
  story: string[];
  gallery: string[];
  team: { role: string; name: string }[];
};

export const realWeddings: RealWedding[] = [
  {
    slug: "hannah-and-wes-autumn-orchard",
    couple: "Hannah & Wes",
    date: "2025-09-27",
    season: "Fall",
    palette: "Terracotta & Sage",
    guests: 165,
    hero: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
    quote: "We cancelled every other tour the moment we drove up the orchard lane. Best weekend of our lives.",
    story: [
      "Hannah and Wes wanted a wedding that felt like a family reunion — unhurried, warm, and full of the people they love. A weekend at the farm was the obvious answer.",
      "They said their vows beneath the heritage apple trees at golden hour, in a palette of terracotta and sage that echoed the turning orchard. Dinner spilled into dancing in the barn, and the night ended around the bonfire.",
      "By Sunday brunch, no one wanted to leave — which, they told us, was exactly the point.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
    ],
    team: [
      { role: "Photography", name: "Amberlight Photography" },
      { role: "Catering", name: "Harvest & Hearth" },
      { role: "Florals", name: "Wildbloom Floral Co." },
    ],
  },
  {
    slug: "priya-and-sam-summer-garden",
    couple: "Priya & Sam",
    date: "2025-06-14",
    season: "Summer",
    palette: "Blush & Sage",
    guests: 120,
    hero: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1800&q=80",
    quote: "The barn at night is pure magic. Our people are still talking about it.",
    story: [
      "A midsummer celebration in soft blush and sage, with wildflowers everywhere you looked.",
      "Priya and Sam leaned into the garden feel — a blooming ceremony arch, bud vases picked from the orchard, and a long farm table under festoon lights.",
      "The covered porch kept cocktail hour cool, and the dancing didn't stop until the last string light dimmed.",
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1470259078422-826894b933ad?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80",
    ],
    team: [
      { role: "Photography", name: "Amberlight Photography" },
      { role: "Planning", name: "Ever After Planning" },
      { role: "Music", name: "The Northcoast DJs" },
    ],
  },
];

export function getRealWedding(slug: string): RealWedding | null {
  return realWeddings.find((w) => w.slug === slug) ?? null;
}
