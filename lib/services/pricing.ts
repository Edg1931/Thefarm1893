/* ============================================================================
   DYNAMIC PRICING / YIELD MANAGEMENT
   Prices any date like a hotel or airline: peak Saturdays command a premium,
   slow winter and off-day dates auto-discount to fill the calendar. Gives the
   public a real quote instantly and gives the owner a revenue-optimizing lever.
   ============================================================================ */

const BASE_SATURDAY = 9800; // signature Weekend package, peak-season Saturday anchor

export type PriceTier = "peak" | "prime" | "value" | "last-minute";

export type Quote = {
  price: number;
  base: number;
  tier: PriceTier;
  label: string;
  reason: string;
  savings?: number;
};

export function priceForDate(isoDate: string): Quote {
  const d = new Date(isoDate + "T12:00:00");
  const month = d.getMonth(); // 0-11
  const dow = d.getDay(); // 0 Sun … 6 Sat
  const daysOut = (d.getTime() - Date.now()) / 86_400_000;

  const peakSeason = month >= 4 && month <= 9; // May–Oct
  const shoulder = month === 3 || month === 10; // Apr, Nov

  // Day-of-week factor
  let dayFactor = 1;
  if (dow === 6) dayFactor = 1; // Saturday anchor
  else if (dow === 5 || dow === 0) dayFactor = 0.78; // Fri / Sun
  else dayFactor = 0.62; // weekday

  // Season factor
  let seasonFactor = 0.8; // deep off-season default (Dec–Mar)
  let tier: PriceTier = "value";
  let reason = "Off-season date — enjoy our best value pricing.";
  let label = "Value Season";

  if (peakSeason && dow === 6) {
    seasonFactor = 1.15; tier = "peak"; label = "Peak Saturday";
    reason = "Our most-requested dates. Peak-season Saturdays book 12–18 months out.";
  } else if (peakSeason) {
    seasonFactor = 1.0; tier = "prime"; label = "Prime Season";
    reason = "Beautiful peak-season date on a Friday or Sunday — a smart value.";
  } else if (shoulder) {
    seasonFactor = 0.92; tier = "prime"; label = "Shoulder Season";
    reason = "Spring/late-fall charm at a gentler rate.";
  }

  let price = Math.round((BASE_SATURDAY * seasonFactor * dayFactor) / 50) * 50;
  const base = Math.round(BASE_SATURDAY / 50) * 50;
  let savings = base > price ? base - price : undefined;

  // Last-minute incentive for near, open dates
  if (daysOut > 0 && daysOut < 120 && tier !== "peak") {
    const bumped = Math.round((price * 0.9) / 50) * 50;
    savings = base - bumped;
    price = bumped;
    tier = "last-minute";
    label = "Last-Minute Offer";
    reason = "This date is coming up soon and still open — we've applied a limited-time incentive.";
  }

  return { price, base, tier, label, reason, savings };
}
