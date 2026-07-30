/* ============================================================================
   UNIFIED CALENDAR MODEL
   One shape for everything that occupies a date — weddings, tentative holds,
   tours, silo stays, and availability blocks (maintenance / iCal / OTA imports).
   The availability engine (lib/services/availability.ts) and the bookings
   calendar both read from this, so "is this date free?" has a single answer.
   ============================================================================ */

import type { BookingEvent } from "./sample-data";
import type { SiloGuest } from "@/lib/silos";

export type ResourceKind = "venue" | "silo" | "room";
export type CalendarKind = "wedding" | "corporate" | "tour" | "tentative" | "silo" | "block";
export type BlockSource = "manual" | "ical" | "ota";

/** A bookable unit: the main venue, a silo, or a farmhouse room. */
export type Resource = {
  id: string;
  name: string;
  slug: string;
  kind: ResourceKind;
  capacity?: number;
  active: boolean;
};

/** A date range a resource is unavailable for (not a guest booking). */
export type AvailabilityBlock = {
  id: string;
  resourceSlug: string; // "venue" for the main venue, else the silo slug
  resourceKind: ResourceKind;
  start: string; // ISO yyyy-mm-dd
  end: string; // ISO yyyy-mm-dd, inclusive
  reason: string;
  source: BlockSource;
};

/** A single occupied item for the unified calendar feed. */
export type CalendarItem = {
  id: string;
  date: string; // ISO start
  endDate?: string; // ISO end (inclusive) for multi-day items
  title: string;
  kind: CalendarKind;
  resource: string;
  detail?: string;
};

export const MAIN_VENUE = "venue";

/* ---- sample data (demo mode) ---------------------------------------------- */

export const sampleResources: Resource[] = [
  { id: "r-venue", name: "The Farm (main venue)", slug: "venue", kind: "venue", capacity: 250, active: true },
  { id: "r-orchard", name: "The Orchard Silo", slug: "the-orchard-silo", kind: "silo", capacity: 4, active: true },
  { id: "r-harvest", name: "The Harvest Silo", slug: "the-harvest-silo", kind: "silo", capacity: 4, active: true },
  { id: "r-copper", name: "The Copper Silo", slug: "the-copper-silo", kind: "silo", capacity: 2, active: true },
  { id: "r-meadow", name: "The Meadow Silo", slug: "the-meadow-silo", kind: "silo", capacity: 6, active: true },
];

export const sampleBlocks: AvailabilityBlock[] = [
  { id: "blk-holiday", resourceSlug: "venue", resourceKind: "venue", start: "2026-12-24", end: "2026-12-26", reason: "Holiday closure", source: "manual" },
  { id: "blk-clean", resourceSlug: "the-orchard-silo", resourceKind: "silo", start: "2026-08-04", end: "2026-08-05", reason: "Deep clean & turnover", source: "manual" },
  { id: "blk-ota", resourceSlug: "the-harvest-silo", resourceKind: "silo", start: "2026-08-15", end: "2026-08-18", reason: "Booked on Airbnb", source: "ota" },
];

/* ---- date helpers --------------------------------------------------------- */

export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Every ISO day in [start, end] inclusive. */
export function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  let guard = 0;
  while (d <= last && guard < 366) {
    out.push(isoDay(d));
    d.setDate(d.getDate() + 1);
    guard++;
  }
  return out;
}

/** Expand a block into the individual ISO days it covers. */
export function blockDays(b: AvailabilityBlock): string[] {
  return eachDay(b.start, b.end);
}

/** Build a unified list of calendar items from events, silo guests, and blocks. */
export function buildCalendar(
  events: BookingEvent[],
  guests: SiloGuest[],
  blocks: AvailabilityBlock[]
): CalendarItem[] {
  const items: CalendarItem[] = [];
  for (const e of events) {
    const kind: CalendarKind =
      e.status === "confirmed"
        ? e.type.toLowerCase().includes("corporate")
          ? "corporate"
          : "wedding"
        : e.status === "tentative"
        ? "tentative"
        : "tour";
    items.push({ id: `${e.date}-${e.title}`, date: e.date, title: e.title, kind, resource: "The Farm (main venue)", detail: e.type });
  }
  for (const g of guests) {
    const end = new Date(g.checkIn + "T00:00:00");
    end.setDate(end.getDate() + Math.max(0, g.nights - 1));
    items.push({
      id: g.id,
      date: g.checkIn,
      endDate: isoDay(end),
      title: `${g.silo} · ${g.name.split(" ")[0]}`,
      kind: "silo",
      resource: g.silo,
      detail: `${g.nights} night${g.nights > 1 ? "s" : ""}`,
    });
  }
  for (const b of blocks) {
    items.push({ id: b.id, date: b.start, endDate: b.end, title: b.reason || "Blocked", kind: "block", resource: b.resourceSlug, detail: b.source });
  }
  return items.sort((a, b) => a.date.localeCompare(b.date));
}
