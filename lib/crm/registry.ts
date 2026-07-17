/* ============================================================================
   WEDDING REGISTRY — a cash-fund registry tied to the real wedding budget.
   Guests contribute toward specific funds: overnight rooms, the bar, photography,
   the honeymoon, and more. Funds flagged coversCost reduce the couple's
   out-of-pocket total (they connect to the lodging/cost system). Payments are
   Stripe-pluggable; contributions here mirror the same money math as the planner.
   ============================================================================ */

export type FundCategory = "lodging" | "experience" | "honeymoon" | "general";

export type Fund = {
  id: string;
  title: string;
  blurb: string;
  goal: number; // 0 = open-ended "give any amount"
  contributed: number;
  category: FundCategory;
  icon: string; // lucide name, resolved in the UI
  coversCost: boolean; // true = giving reduces the couple's wedding total
};

export type Registry = {
  slug: string;
  coupleName: string;
  intro: string;
  funds: Fund[];
};

export const registries: Record<string, Registry> = {
  "hannah-and-wes": {
    slug: "hannah-and-wes",
    coupleName: "Hannah & Wes",
    intro:
      "Your presence is the only present we need — but if you'd like to give, we've traded the toaster for the things that make our farm weekend unforgettable. Every gift goes straight to our celebration (and some even lower our costs!).",
    funds: [
      { id: "F-room-orchard", title: "Sponsor the Orchard Suite", blurb: "Cover a night in the farmhouse for our parents.", goal: 480, contributed: 120, category: "lodging", icon: "BedDouble", coversCost: true },
      { id: "F-room-loft", title: "Sponsor a Loft Room", blurb: "Help put our wedding party up on-site.", goal: 340, contributed: 340, category: "lodging", icon: "BedDouble", coversCost: true },
      { id: "F-silo-harvest", title: "Sponsor The Harvest Silo", blurb: "Gift a whole silo for our family's weekend stay.", goal: 498, contributed: 150, category: "lodging", icon: "BedDouble", coversCost: true },
      { id: "F-bar", title: "The Bar Tab", blurb: "Signature cider cocktails & a toast on us.", goal: 2500, contributed: 900, category: "experience", icon: "Wine", coversCost: true },
      { id: "F-photo", title: "Golden-Hour Photography", blurb: "An extra hour of orchard portraits at sunset.", goal: 800, contributed: 300, category: "experience", icon: "Camera", coversCost: true },
      { id: "F-pizza", title: "Late-Night Pizza Party", blurb: "Wood-fired pizzas when the dancing gets hungry.", goal: 800, contributed: 800, category: "experience", icon: "Pizza", coversCost: true },
      { id: "F-lights", title: "Bistro Lights in the Barn", blurb: "That magical festoon-lit glow for the reception.", goal: 600, contributed: 150, category: "experience", icon: "Sparkles", coversCost: true },
      { id: "F-honeymoon", title: "Honeymoon in Tuscany", blurb: "A vineyard night on our first trip as newlyweds.", goal: 1500, contributed: 650, category: "honeymoon", icon: "Plane", coversCost: false },
      { id: "F-home", title: "Our First Home Together", blurb: "Little things to feather our new nest.", goal: 2000, contributed: 420, category: "honeymoon", icon: "Home", coversCost: false },
      { id: "F-wishing", title: "The Wishing Well", blurb: "Give any amount toward whatever we need most.", goal: 0, contributed: 500, category: "general", icon: "Heart", coversCost: false },
    ],
  },
};

export function getRegistry(slug: string): Registry | null {
  return registries[slug] ?? null;
}

export function summarizeRegistry(funds: Fund[]) {
  const totalGifted = funds.reduce((s, f) => s + f.contributed, 0);
  const goalTotal = funds.reduce((s, f) => s + f.goal, 0);
  const costOffset = funds.filter((f) => f.coversCost).reduce((s, f) => s + f.contributed, 0);
  const fullyFunded = funds.filter((f) => f.goal > 0 && f.contributed >= f.goal).length;
  return { totalGifted, goalTotal, costOffset, fullyFunded };
}
