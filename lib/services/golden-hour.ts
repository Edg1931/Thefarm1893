/* ============================================================================
   GOLDEN-HOUR INTELLIGENCE
   Computes true sunset at The Farm 1893's coordinates for any date and
   recommends the ideal ceremony start time for the best light. Pure math
   (NOAA sunrise/sunset algorithm) — no API key, no external call.
   ============================================================================ */

// Berlin Heights, OH
const LAT = 41.3159;
const LNG = -82.4635;
const ZENITH = 90.8333; // official sunset

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm = (v: number, max: number) => ((v % max) + max) % max;

/** US Eastern DST: 2nd Sunday March → 1st Sunday November. Returns UTC offset hrs. */
function easternOffset(date: Date): number {
  const y = date.getUTCFullYear();
  const march = new Date(Date.UTC(y, 2, 1));
  const secondSunMarch = 8 + ((7 - march.getUTCDay()) % 7);
  const nov = new Date(Date.UTC(y, 10, 1));
  const firstSunNov = 1 + ((7 - nov.getUTCDay()) % 7);
  const start = Date.UTC(y, 2, secondSunMarch, 7); // 2am EST = 7 UTC
  const end = Date.UTC(y, 10, firstSunNov, 6);
  const t = date.getTime();
  return t >= start && t < end ? -4 : -5;
}

/** Returns sunset time (minutes from local midnight) for a given ISO date. */
export function sunsetMinutes(isoDate: string): number | null {
  const date = new Date(isoDate + "T12:00:00Z");
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const N = Math.floor((date.getTime() - start) / 86_400_000);

  const lngHour = LNG / 15;
  const t = N + (18 - lngHour) / 24; // sunset
  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(rad(M)) + 0.02 * Math.sin(rad(2 * M)) + 282.634;
  L = norm(L, 360);

  let RA = deg(Math.atan(0.91764 * Math.tan(rad(L))));
  RA = norm(RA, 360);
  RA += (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90);
  RA /= 15;

  const sinDec = 0.39782 * Math.sin(rad(L));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(rad(ZENITH)) - sinDec * Math.sin(rad(LAT))) / (cosDec * Math.cos(rad(LAT)));
  if (cosH > 1 || cosH < -1) return null;

  const H = deg(Math.acos(cosH)) / 15;
  const T = H + RA - 0.06571 * t - 6.622;
  const UT = norm(T - lngHour, 24);
  const local = norm(UT + easternOffset(date), 24);
  return Math.round(local * 60);
}

function fmt(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export type GoldenHour = {
  sunset: string;
  goldenStart: string;
  ceremonyStart: string;
  note: string;
};

/** The couple-facing recommendation. */
export function goldenHourPlan(isoDate: string): GoldenHour | null {
  const s = sunsetMinutes(isoDate);
  if (s == null) return null;
  return {
    sunset: fmt(s),
    goldenStart: fmt(s - 60), // golden hour ≈ last hour before sunset
    ceremonyStart: fmt(s - 90), // start ~90 min before sunset → portraits land in golden light
    note: `Sunset is at ${fmt(s)}. For dreamy light, we suggest starting your ceremony around ${fmt(s - 90)} — you'll say "I do" in soft light and catch golden hour for portraits just after.`,
  };
}
