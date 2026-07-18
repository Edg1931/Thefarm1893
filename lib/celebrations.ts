/* ============================================================================
   GUEST MICROSITES — one branded mini-site per booked celebration.
   The CRM auto-generates these from a booking. Every guest who visits lands on
   a Farm-1893-branded page (schedule, lodging, directions, local guide, RSVP)
   — turning each wedding into free exposure to hundreds of future couples.
   Demo data below; in production these come from Supabase per booking.
   ============================================================================ */

export type Celebration = {
  slug: string;
  couple: string;
  date: string; // ISO
  hero: string;
  hashtag: string;
  welcome: string;
  schedule: { time: string; title: string; detail: string }[];
  rooms: { name: string; guests: string }[];
  local: { name: string; type: string; note: string }[];
  registryUrl?: string;
  // Per-section privacy — the couple chooses what's public vs. invited-guests-only.
  accessCode: string;
  privacy: Record<string, "public" | "private">;
};

/** Gate-able microsite sections, in display order — used by the couple's controls. */
export const PRIVACY_SECTIONS: { key: string; label: string; note: string }[] = [
  { key: "schedule", label: "Schedule of events", note: "Your weekend timeline" },
  { key: "rooms", label: "Room assignments & reservations", note: "Who's staying where" },
  { key: "local", label: "Around town", note: "Local guide for guests" },
  { key: "registry", label: "Registry & gift funds", note: "" },
  { key: "rsvp", label: "RSVP", note: "" },
];

export const celebrations: Record<string, Celebration> = {
  "hannah-and-wes": {
    slug: "hannah-and-wes",
    couple: "Hannah & Wes",
    date: "2026-09-19",
    hero: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2100&q=80",
    hashtag: "#HannahAndWes2026",
    welcome:
      "We can't wait to celebrate with you at The Farm 1893! We've gathered everything you'll need for our weekend in the orchard right here. Grab a coffee, take a look, and let us know you're coming.",
    schedule: [
      { time: "Fri · 6:00 PM", title: "Welcome Bonfire", detail: "Casual s'mores & drinks by the fire pit. Come as you are." },
      { time: "Sat · 4:30 PM", title: "Ceremony in the Orchard", detail: "Seated by 4:15. Golden-hour vows beneath the apple trees." },
      { time: "Sat · 5:30 PM", title: "Cocktail Hour", detail: "Covered porch — signature cider cocktails & lawn games." },
      { time: "Sat · 6:30 PM", title: "Dinner & Dancing", detail: "In the barn until midnight. Farm-to-table feast." },
      { time: "Sun · 10:00 AM", title: "Farewell Brunch", detail: "One last morning together before we say goodbye." },
    ],
    rooms: [
      { name: "The Orchard Suite", guests: "Parents of the couple" },
      { name: "The Loft Rooms", guests: "Wedding party" },
      { name: "The Garden Rooms", guests: "Out-of-town family" },
    ],
    local: [
      { name: "Cedar Point", type: "Attraction", note: "20 min — world-class coaster park on Lake Erie." },
      { name: "Downtown Sandusky", type: "Dining", note: "15 min — waterfront restaurants & shops." },
      { name: "Berlin Heights B&Bs", type: "Lodging", note: "Charming stays a few minutes from the farm." },
    ],
    registryUrl: "#",
    accessCode: "ORCHARD26",
    privacy: {
      schedule: "private", // just for invited guests
      rooms: "private",     // room assignments are private
      local: "public",
      registry: "public",
      rsvp: "public",
    },
  },
};

export function getCelebration(slug: string): Celebration | null {
  return celebrations[slug] ?? null;
}
