/* ============================================================================
   BILLABLE FEES — the revenue the farm is entitled to but keeps forgetting.

   Straight from the owner's notes: outside vendors that don't go through the
   preferred list, late checkouts past the grace window, and extra walkthroughs
   beyond the ones included in the package. Each one is small; together they're
   thousands a season. The rates live in the database (`fee_types`) so they can
   be changed without a deploy — these are the defaults the DB is seeded with.
   ============================================================================ */

export type FeeUnit = "flat" | "hour";

export type FeeType = {
  code: string;
  label: string;
  amount: number;
  unit: FeeUnit;
  /** Minutes of slack before a time-based fee applies (late checkout). */
  graceMinutes: number;
  active: boolean;
  notes?: string;
};

export type FeeCharge = {
  id: string;
  feeCode: string;
  eventTitle: string;
  quantity: number;
  amount: number;
  reason: string;
  waived: boolean;
  invoiced: boolean;
  createdAt: string;
};

/** The owner's numbers. `amount` is the midpoint where the notes give a range. */
export const defaultFeeTypes: FeeType[] = [
  {
    code: "outside_vendor", label: "Outside vendor fee", amount: 350, unit: "flat", graceMinutes: 0, active: true,
    notes: "Charged when a couple books a caterer or bar service off the preferred list ($200–500 depending on scope). Covers extra supervision, insurance review, and cleanup risk.",
  },
  {
    code: "late_checkout", label: "Late checkout / overtime", amount: 120, unit: "hour", graceMinutes: 15, active: true,
    notes: "Applies after a 15-minute grace window, then bills by the hour. Protects the turnover crew's schedule when a party runs long.",
  },
  {
    code: "extra_walkthrough", label: "Additional walkthrough", amount: 120, unit: "hour", graceMinutes: 0, active: true,
    notes: "Package includes one planning walkthrough. Extra site visits — vendor meetings, rehearsal add-ons, day-of consults — bill hourly.",
  },
];

/** Late checkout with the grace window applied. Returns 0 inside the grace. */
export function lateCheckoutCharge(minutesLate: number, fee: FeeType): { hours: number; amount: number } {
  const billable = minutesLate - (fee.graceMinutes || 0);
  if (billable <= 0) return { hours: 0, amount: 0 };
  const hours = Math.ceil(billable / 60); // partial hours round up
  return { hours, amount: Math.round(hours * fee.amount * 100) / 100 };
}

export function chargeAmount(fee: FeeType, quantity: number): number {
  return Math.round(fee.amount * Math.max(quantity, 0) * 100) / 100;
}

/** What's owed but not yet on an invoice — the number the owner actually wants. */
export function uncapturedTotal(charges: FeeCharge[]): number {
  return charges.filter((c) => !c.waived && !c.invoiced).reduce((s, c) => s + c.amount, 0);
}

/* ---- sample data (demo mode) ---------------------------------------------- */

export const sampleCharges: FeeCharge[] = [
  { id: "FC-1", feeCode: "outside_vendor", eventTitle: "Whitfield Wedding", quantity: 1, amount: 350, reason: "Outside caterer — Harvest & Vine", waived: false, invoiced: false, createdAt: "2026-07-28" },
  { id: "FC-2", feeCode: "late_checkout", eventTitle: "Coleman Wedding", quantity: 2, amount: 240, reason: "Guests cleared at 12:52a (2h 7m past)", waived: false, invoiced: true, createdAt: "2026-07-27" },
  { id: "FC-3", feeCode: "extra_walkthrough", eventTitle: "Nguyen Wedding", quantity: 1.5, amount: 180, reason: "Second site visit with florist", waived: false, invoiced: false, createdAt: "2026-07-19" },
  { id: "FC-4", feeCode: "late_checkout", eventTitle: "Bauer Rehearsal", quantity: 0, amount: 0, reason: "Cleared 11 min past — inside grace window", waived: true, invoiced: false, createdAt: "2026-07-11" },
];
