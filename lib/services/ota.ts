/* ============================================================================
   OTA SYNC (Airbnb / VRBO) — neither offers a simple public write API, so the
   reliable default is two-way iCal: we export our .ics (see /api/calendar/ical)
   and import theirs into `availability_blocks` (source "ota"), closing the loop
   so a booking anywhere blocks the dates everywhere. A channel-manager adapter
   (e.g. Hostaway) can slot in later. Mock-first for demo.
   ============================================================================ */

export function otaConfigured(): boolean {
  return Boolean(process.env.HOSTAWAY_API_KEY);
}

export type ParsedBlock = { start: string; end: string; summary: string; uid: string };

function toIso(dt: string): string {
  // handles YYYYMMDD and YYYYMMDDTHHMMSSZ
  const m = dt.match(/(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : dt;
}

/** Parse an iCal feed body into date-range blocks (basic VEVENT extraction). */
export function parseIcal(body: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const events = body.split("BEGIN:VEVENT").slice(1);
  for (const ev of events) {
    const start = ev.match(/DTSTART[^:]*:([0-9TZ]+)/)?.[1];
    const end = ev.match(/DTEND[^:]*:([0-9TZ]+)/)?.[1];
    const summary = ev.match(/SUMMARY:(.*)/)?.[1]?.trim() ?? "Reserved";
    const uid = ev.match(/UID:(.*)/)?.[1]?.trim() ?? `${start}-${end}`;
    if (start) {
      // iCal DTEND is exclusive; step back a day for an inclusive end.
      let inclusiveEnd = toIso(end ?? start);
      if (end) { const d = new Date(toIso(end) + "T00:00:00"); d.setDate(d.getDate() - 1); inclusiveEnd = d.toISOString().slice(0, 10); }
      blocks.push({ start: toIso(start), end: inclusiveEnd, summary, uid });
    }
  }
  return blocks;
}

/** Fetch + parse a remote iCal feed. Returns [] on any failure (best-effort). */
export async function importIcalFeed(url: string): Promise<ParsedBlock[]> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "TheFarm1893/VenueOS" } });
    if (!res.ok) return [];
    return parseIcal(await res.text());
  } catch {
    return [];
  }
}
