/* ============================================================================
   AVAILABILITY ENGINE — the single source of truth for "is this date free?".
   Consults confirmed/tentative events, silo stays, and availability_blocks
   (manual holds + iCal/OTA imports). Reads live Supabase rows when configured,
   otherwise the polished sample data so the flow works in a walkthrough.
   Enforced on write by /api/silos/book and the public availability checker.
   ============================================================================ */

import { getServiceClient } from "@/lib/supabase/server";
import { bookedDates } from "@/lib/crm/sample-data";
import { siloGuests as sampleSiloGuests } from "@/lib/silos";
import {
  sampleBlocks,
  blockDays,
  eachDay,
  isoDay,
  type AvailabilityBlock,
  type BlockSource,
} from "@/lib/crm/calendar";

type Row = Record<string, unknown>;
const str = (v: unknown, d = "") => (v == null ? d : String(v));

function mapBlock(r: Row): AvailabilityBlock {
  return {
    id: str(r.id),
    resourceSlug: str(r.resource_slug, "venue"),
    resourceKind: (str(r.resource_kind, "venue") as AvailabilityBlock["resourceKind"]),
    start: str(r.start_date),
    end: str(r.end_date, str(r.start_date)),
    reason: str(r.reason),
    source: (str(r.source, "manual") as BlockSource),
  };
}

/** All availability blocks (live or sample). */
export async function getBlocks(): Promise<{ live: boolean; blocks: AvailabilityBlock[] }> {
  const sb = getServiceClient();
  if (!sb) return { live: false, blocks: sampleBlocks };
  try {
    const { data, error } = await sb.from("availability_blocks").select("*").limit(1000);
    if (error) throw error;
    return { live: true, blocks: (data ?? []).map(mapBlock) };
  } catch (e) {
    console.error("[availability] getBlocks", e);
    return { live: true, blocks: [] };
  }
}

/** ISO days the main venue is already spoken for (bookings + venue blocks). */
export async function takenVenueDates(): Promise<Set<string>> {
  const sb = getServiceClient();
  const taken = new Set<string>();
  if (!sb) {
    for (const d of bookedDates) taken.add(d);
    for (const b of sampleBlocks) if (b.resourceSlug === "venue") blockDays(b).forEach((d) => taken.add(d));
    return taken;
  }
  try {
    const { data } = await sb.from("events").select("event_date,end_date,status").in("status", ["confirmed", "tentative"]);
    for (const r of (data ?? []) as Row[]) {
      const start = str(r.event_date);
      if (!start) continue;
      const end = str(r.end_date, start);
      eachDay(start, end).forEach((d) => taken.add(d));
    }
    const { blocks } = await getBlocks();
    for (const b of blocks) if (b.resourceSlug === "venue") blockDays(b).forEach((d) => taken.add(d));
  } catch (e) {
    console.error("[availability] takenVenueDates", e);
  }
  return taken;
}

/** ISO days a specific silo is occupied (stays + that silo's blocks). */
export async function takenSiloDates(slug: string): Promise<Set<string>> {
  const sb = getServiceClient();
  const taken = new Set<string>();
  const addStay = (checkIn: string, nights: number) => {
    const d = new Date(checkIn + "T00:00:00");
    for (let i = 0; i < Math.max(1, nights); i++) {
      taken.add(isoDay(d));
      d.setDate(d.getDate() + 1);
    }
  };
  if (!sb) {
    for (const g of sampleSiloGuests) {
      // sample guests store the silo display name; match loosely to the slug
      const guestSlug = g.silo.toLowerCase().replace(/\s+/g, "-");
      if (guestSlug === slug) addStay(g.checkIn, g.nights);
    }
    for (const b of sampleBlocks) if (b.resourceSlug === slug) blockDays(b).forEach((d) => taken.add(d));
    return taken;
  }
  try {
    const { data } = await sb.from("silo_guests").select("silo,check_in,nights,status").not("status", "eq", "cancelled");
    for (const r of (data ?? []) as Row[]) {
      const guestSlug = str(r.silo).toLowerCase().replace(/\s+/g, "-");
      if (guestSlug !== slug) continue;
      addStay(str(r.check_in), Number(r.nights) || 1);
    }
    const { blocks } = await getBlocks();
    for (const b of blocks) if (b.resourceSlug === slug) blockDays(b).forEach((d) => taken.add(d));
  } catch (e) {
    console.error("[availability] takenSiloDates", e);
  }
  return taken;
}

function nextOpenSaturdays(from: Date, taken: Set<string>, n = 3): string[] {
  const out: string[] = [];
  const d = new Date(from);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  let guard = 0;
  while (out.length < n && guard < 60) {
    const iso = isoDay(d);
    if (!taken.has(iso)) out.push(iso);
    d.setDate(d.getDate() + 7);
    guard++;
  }
  return out;
}

export type VenueCheck = { available: boolean; alternatives: string[] };

/** Is the venue free on this date? If not, suggest the next open Saturdays. */
export async function checkVenueDate(date: string): Promise<VenueCheck> {
  const taken = await takenVenueDates();
  const available = !taken.has(date);
  return { available, alternatives: available ? [] : nextOpenSaturdays(new Date(date + "T00:00:00"), taken) };
}

export type SiloCheck = { available: boolean; conflictDates: string[] };

/** Is this silo free for the whole [checkIn, checkIn+nights) stay? */
export async function checkSiloNights(slug: string, checkIn: string, nights: number): Promise<SiloCheck> {
  const taken = await takenSiloDates(slug);
  const conflictDates: string[] = [];
  const d = new Date(checkIn + "T00:00:00");
  for (let i = 0; i < Math.max(1, nights); i++) {
    const iso = isoDay(d);
    if (taken.has(iso)) conflictDates.push(iso);
    d.setDate(d.getDate() + 1);
  }
  return { available: conflictDates.length === 0, conflictDates };
}
