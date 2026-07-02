/* ============================================================================
   CLIENT DOSSIERS — the full picture of a booking in one place.
   Everything venue staff need to run an event: the couple, the date, their
   assigned vendor team (catering / photography / makeup / florals / music …),
   payments, a planning checklist, notes, and a link to the guest microsite.
   Rich demo data for featured clients; sensible auto-derived data for the rest.
   ============================================================================ */

import { leads, type Lead } from "./sample-data";

export type VendorRole =
  | "Catering" | "Photography" | "Videography" | "Hair & Makeup"
  | "Florals" | "Music / DJ" | "Planning" | "Cake" | "Rentals";

export type VendorAssignment = {
  role: VendorRole;
  name: string | null;
  contact?: string;
  status: "confirmed" | "pending" | "needed";
};

export type Payment = { label: string; amount: number; due: string; paid: boolean };
export type ChecklistItem = { label: string; done: boolean };

export type Dossier = {
  leadId: string;
  micrositeSlug: string | null;
  coordinator: string;
  package: string;
  contractValue: number;
  vendors: VendorAssignment[];
  payments: Payment[];
  checklist: ChecklistItem[];
  notes: string;
};

const ROLES: VendorRole[] = [
  "Catering", "Photography", "Hair & Makeup", "Florals",
  "Music / DJ", "Planning", "Cake", "Rentals",
];

/** Rich, hand-authored dossiers for the marquee clients. */
const FEATURED: Record<string, Partial<Dossier>> = {
  "L-1042": {
    micrositeSlug: "hannah-and-wes",
    coordinator: "Megan (Lead Coordinator)",
    package: "The Weekend",
    contractValue: 11250,
    vendors: [
      { role: "Catering", name: "Harvest & Hearth Catering", contact: "events@harvesthearth.com", status: "confirmed" },
      { role: "Photography", name: "Amberlight Photography", contact: "hello@amberlight.co", status: "confirmed" },
      { role: "Hair & Makeup", name: "Gilded Grace Beauty", contact: "book@gildedgrace.com", status: "confirmed" },
      { role: "Florals", name: "Wildbloom Floral Co.", contact: "studio@wildbloom.com", status: "pending" },
      { role: "Music / DJ", name: "The Northcoast DJs", contact: "info@northcoastdjs.com", status: "confirmed" },
      { role: "Planning", name: "Ever After Planning", contact: "team@everafter.com", status: "confirmed" },
      { role: "Cake", name: "Sugar Maple Bakehouse", contact: "orders@sugarmaple.com", status: "pending" },
      { role: "Rentals", name: null, status: "needed" },
    ],
    payments: [
      { label: "Deposit (25%)", amount: 2800, due: "2025-10-05", paid: true },
      { label: "Second installment", amount: 4225, due: "2026-05-19", paid: true },
      { label: "Final balance", amount: 4225, due: "2026-08-19", paid: false },
    ],
    checklist: [
      { label: "Contract signed", done: true },
      { label: "Deposit received", done: true },
      { label: "Vendor team assigned", done: true },
      { label: "Final guest count confirmed", done: false },
      { label: "Floor plan approved", done: false },
      { label: "Final walkthrough scheduled", done: false },
      { label: "Balance paid", done: false },
    ],
    notes: "Couple is dreaming of a golden-hour orchard ceremony. Bride's mother is the main contact for the rehearsal dinner. Wants extra bistro lighting in the barn — flag to Rentals.",
  },
  "L-1039": {
    coordinator: "Megan (Lead Coordinator)",
    package: "The Gathering",
    contractValue: 12000,
    vendors: [
      { role: "Catering", name: "Harvest & Hearth Catering", contact: "events@harvesthearth.com", status: "confirmed" },
      { role: "Music / DJ", name: "The Northcoast DJs", status: "confirmed" },
      { role: "Rentals", name: "Lantern & Co. Rentals", status: "pending" },
    ],
    payments: [
      { label: "Deposit (25%)", amount: 3000, due: "2026-05-01", paid: true },
      { label: "Final balance", amount: 9000, due: "2026-08-01", paid: false },
    ],
    checklist: [
      { label: "Contract signed", done: true },
      { label: "Deposit received", done: true },
      { label: "A/V requirements gathered", done: true },
      { label: "Final headcount", done: false },
      { label: "Balance paid", done: false },
    ],
    notes: "Corporate retreat for The Bauer Company. Needs strong Wi-Fi + projector in the barn. Upsell: add-on bonfire reception night 2.",
  },
};

/** Returns a complete dossier for any lead — featured data if present, else derived. */
export function getDossier(leadId: string): { lead: Lead; dossier: Dossier } | null {
  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  const featured = FEATURED[leadId];
  const booked = lead.stage === "booked" || lead.stage === "proposal";

  const vendors: VendorAssignment[] =
    featured?.vendors ??
    ROLES.map((role) => ({
      role,
      name: null,
      status: booked ? ("pending" as const) : ("needed" as const),
    }));

  const value = featured?.contractValue ?? lead.budget;
  const payments: Payment[] =
    featured?.payments ??
    [
      { label: "Deposit (25%)", amount: Math.round((value * 0.25) / 50) * 50, due: lead.eventDate, paid: booked },
      { label: "Final balance", amount: Math.round((value * 0.75) / 50) * 50, due: lead.eventDate, paid: false },
    ];

  const checklist: ChecklistItem[] =
    featured?.checklist ??
    [
      { label: "Contract signed", done: booked },
      { label: "Deposit received", done: booked },
      { label: "Vendor team assigned", done: false },
      { label: "Final guest count confirmed", done: false },
      { label: "Balance paid", done: false },
    ];

  return {
    lead,
    dossier: {
      leadId,
      micrositeSlug: featured?.micrositeSlug ?? null,
      coordinator: featured?.coordinator ?? "Unassigned",
      package: featured?.package ?? (lead.guestCount >= 90 ? "The Weekend" : "The Gathering"),
      contractValue: value,
      vendors,
      payments,
      checklist,
      notes: featured?.notes ?? lead.aiSummary,
    },
  };
}
