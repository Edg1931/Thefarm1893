/* ============================================================================
   PORTAL DATA MODEL
   The authenticated surfaces for couples, guests, and vendors — messages,
   documents, seating, and RSVPs. Sample data keeps the portals fully usable in
   a walkthrough; live rows come from Supabase once configured (see data.ts).
   ============================================================================ */

export type PortalSender = "couple" | "staff" | "vendor" | "guest";

export type PortalMessage = {
  id: string;
  leadId: string;
  sender: PortalSender;
  body: string;
  createdAt: string;
};

export type PortalDocument = {
  id: string;
  leadId: string;
  name: string;
  kind: string; // contract | invoice | insurance | inspiration | other
  url: string;
  uploadedBy: PortalSender;
  createdAt: string;
};

export type SeatingTable = {
  id: string;
  label: string;
  capacity: number;
  guests: string[];
};

export type Rsvp = {
  id: string;
  weddingSlug: string;
  guestName: string;
  email: string;
  partySize: number;
  meal: string;
  status: "attending" | "declined" | "pending";
};

export type PortalIdentity = {
  leadId: string;
  coupleName: string;
  eventDate: string;
  package: string;
  totalValue: number;
  balanceDue: number;
  coordinator: string;
};

/* ---- sample data (demo mode) — keyed to Hannah Whitfield (L-1042) ---------- */

export const DEMO_LEAD_ID = "L-1042";

export const sampleIdentities: Record<string, PortalIdentity> = {
  "L-1042": {
    leadId: "L-1042",
    coupleName: "Hannah & Wes",
    eventDate: "2026-09-19",
    package: "The Whole Weekend",
    totalValue: 24000,
    balanceDue: 8400,
    coordinator: "Rosie (Farm 1893)",
  },
};

export const sampleMessages: Record<string, PortalMessage[]> = {
  "L-1042": [
    { id: "m1", leadId: "L-1042", sender: "staff", body: "Welcome to your planning portal! Everything for your weekend lives here — timeline, documents, seating, and your balance. Ask us anything.", createdAt: "2026-07-10T15:00:00Z" },
    { id: "m2", leadId: "L-1042", sender: "couple", body: "So excited! Quick question — can we do the rehearsal dinner in the orchard Friday evening?", createdAt: "2026-07-11T18:22:00Z" },
    { id: "m3", leadId: "L-1042", sender: "staff", body: "Absolutely — the orchard is yours all weekend. I'll pencil the rehearsal for 6pm Friday and add it to your timeline.", createdAt: "2026-07-11T19:05:00Z" },
  ],
};

export const sampleDocuments: Record<string, PortalDocument[]> = {
  "L-1042": [
    { id: "d1", leadId: "L-1042", name: "Venue Contract — signed.pdf", kind: "contract", url: "#", uploadedBy: "staff", createdAt: "2026-06-20T12:00:00Z" },
    { id: "d2", leadId: "L-1042", name: "Deposit receipt.pdf", kind: "invoice", url: "#", uploadedBy: "staff", createdAt: "2026-06-20T12:05:00Z" },
    { id: "d3", leadId: "L-1042", name: "Our inspiration board.pdf", kind: "inspiration", url: "#", uploadedBy: "couple", createdAt: "2026-07-02T09:30:00Z" },
  ],
};

export const sampleSeating: Record<string, SeatingTable[]> = {
  "L-1042": [
    { id: "t1", label: "Sweetheart", capacity: 2, guests: ["Hannah", "Wes"] },
    { id: "t2", label: "Table 1 — Family", capacity: 8, guests: ["Mom", "Dad", "Grandma Ruth", "Uncle Pete"] },
    { id: "t3", label: "Table 2 — College", capacity: 8, guests: ["Dana", "Marcus", "Priya"] },
    { id: "t4", label: "Table 3", capacity: 8, guests: [] },
  ],
};

export const sampleRsvps: Record<string, Rsvp[]> = {
  "hannah-and-wes": [
    { id: "rsvp1", weddingSlug: "hannah-and-wes", guestName: "Dana Kim", email: "dana@email.com", partySize: 2, meal: "Chicken", status: "attending" },
    { id: "rsvp2", weddingSlug: "hannah-and-wes", guestName: "Marcus Lee", email: "marcus@email.com", partySize: 1, meal: "Vegetarian", status: "attending" },
    { id: "rsvp3", weddingSlug: "hannah-and-wes", guestName: "Aunt Carol", email: "carol@email.com", partySize: 2, meal: "Beef", status: "pending" },
  ],
};

/* ---- vendor portal sample -------------------------------------------------- */

export type VendorAssignment = {
  eventTitle: string;
  eventDate: string;
  role: string;
  arrivalTime: string;
  status: "confirmed" | "pending";
  insuranceOnFile: boolean;
};

export const sampleVendorSchedule: VendorAssignment[] = [
  { eventTitle: "Whitfield–Hart Wedding", eventDate: "2026-09-19", role: "Photography", arrivalTime: "1:00 PM", status: "confirmed", insuranceOnFile: true },
  { eventTitle: "Coleman Wedding", eventDate: "2026-10-10", role: "Photography", arrivalTime: "12:30 PM", status: "confirmed", insuranceOnFile: true },
  { eventTitle: "Bauer Co. Retreat", eventDate: "2026-08-22", role: "Photography", arrivalTime: "9:00 AM", status: "pending", insuranceOnFile: false },
];
