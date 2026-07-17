/* ============================================================================
   WEDDING COST + LODGING SPLIT
   The full itemized wedding budget, where overnight rooms can be delegated to
   individual guests who pay their own share — reducing the couple's total live.
   Shared by the couple-facing Cost Planner, the guest "Reserve Your Room" module
   on the microsite, and the CRM dossier. Payments are pluggable (Stripe-ready).
   ============================================================================ */

export type CostItem = {
  label: string;
  detail: string;
  amount: number;
  category: "venue" | "addon";
};

export type CoveredBy = "couple" | "guest" | "registry";

export type Room = {
  id: string;
  name: string;
  description: string;
  sleeps: number;
  price: number; // whole-weekend price for the room
  coveredBy: CoveredBy;
  guestName?: string;
  paid: boolean;
  type?: "farmhouse" | "silo"; // silos are assignable, individually-rentable units
};

export type WeddingBudget = {
  slug: string;
  coupleName: string;
  eventDate: string;
  items: CostItem[];
  rooms: Room[];
};

export const budgets: Record<string, WeddingBudget> = {
  "hannah-and-wes": {
    slug: "hannah-and-wes",
    coupleName: "Hannah & Wes",
    eventDate: "2026-09-19",
    items: [
      { label: "The Weekend Venue Package", detail: "Exclusive Fri–Sun, ceremony + reception", amount: 9000, category: "venue" },
      { label: "Catering — Harvest & Hearth", detail: "Farm-to-table, 165 guests", amount: 8250, category: "venue" },
      { label: "Bar service", detail: "Signature cider cocktails + beer/wine", amount: 2500, category: "addon" },
      { label: "Bistro lighting upgrade", detail: "Extra festoon lighting in the barn", amount: 600, category: "addon" },
      { label: "Late-night snack station", detail: "Wood-fired pizzas at 10PM", amount: 800, category: "addon" },
    ],
    rooms: [
      { id: "R1", name: "The Orchard Suite", description: "King bed · private bath · orchard view", sleeps: 2, price: 480, coveredBy: "couple", paid: false },
      { id: "R2", name: "The Loft — Room A", description: "Queen bed · shared bath", sleeps: 2, price: 340, coveredBy: "guest", guestName: "Mom & Dad Whitfield", paid: true },
      { id: "R3", name: "The Loft — Room B", description: "Two twin beds · shared bath", sleeps: 2, price: 320, coveredBy: "guest", guestName: "The Coleman family", paid: false },
      { id: "R4", name: "The Garden Room 1", description: "Queen bed · garden patio", sleeps: 2, price: 360, coveredBy: "couple", paid: false },
      { id: "R5", name: "The Garden Room 2", description: "Queen bed · garden patio", sleeps: 2, price: 360, coveredBy: "couple", paid: false },
      { id: "R6", name: "The Bunk Room", description: "Four bunks · great for the crew", sleeps: 4, price: 420, coveredBy: "guest", guestName: "Bridesmaids", paid: false },
      { id: "R7", name: "The Cottage", description: "King + sofa bed · full kitchenette", sleeps: 3, price: 450, coveredBy: "couple", paid: false, type: "farmhouse" },
      { id: "R8", name: "The Roost", description: "Cozy queen · top of the farmhouse", sleeps: 2, price: 300, coveredBy: "couple", paid: false, type: "farmhouse" },
      // The silos — assign each to a guest couple, cover it yourself, or put it on the registry.
      { id: "S1", name: "The Orchard Silo", description: "Romantic round retreat · sleeps 2", sleeps: 2, price: 378, coveredBy: "guest", guestName: "Aunt Carol & Uncle Jim", paid: false, type: "silo" },
      { id: "S2", name: "The Harvest Silo", description: "Family silo w/ loft · sleeps 4", sleeps: 4, price: 498, coveredBy: "registry", paid: false, type: "silo" },
      { id: "S3", name: "The Copper Silo", description: "Luxe silo · soaking tub · sleeps 2", sleeps: 2, price: 558, coveredBy: "couple", paid: false, type: "silo" },
      { id: "S4", name: "The Meadow Silo", description: "3-bedroom silo · sleeps 6", sleeps: 6, price: 658, coveredBy: "guest", guestName: "The college crew", paid: false, type: "silo" },
    ],
  },
};

export function getBudget(slug: string): WeddingBudget | null {
  return budgets[slug] ?? null;
}

/** Pure math the UI mirrors client-side. */
export function summarize(items: CostItem[], rooms: Room[]) {
  const base = items.reduce((s, i) => s + i.amount, 0);
  const lodgingTotal = rooms.reduce((s, r) => s + r.price, 0);
  const fullTotal = base + lodgingTotal;
  const delegated = rooms.filter((r) => r.coveredBy === "guest").reduce((s, r) => s + r.price, 0);
  const onRegistry = rooms.filter((r) => r.coveredBy === "registry").reduce((s, r) => s + r.price, 0);
  const guestPaid = rooms.filter((r) => r.coveredBy === "guest" && r.paid).reduce((s, r) => s + r.price, 0);
  // Anything a guest covers OR the registry gifts comes off the couple's total.
  const coupleTotal = fullTotal - delegated - onRegistry;
  return { base, lodgingTotal, fullTotal, delegated, onRegistry, guestPaid, coupleTotal };
}
