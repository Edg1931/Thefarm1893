import { getCalendar } from "@/lib/crm/data";
import { eachDay } from "@/lib/crm/calendar";

export const runtime = "nodejs";

/**
 * GET — publishes the venue's confirmed schedule as an .ics feed. This is the
 * read side of external calendar sync: the owner (or an OTA) can subscribe to
 * this URL in Google/Outlook/Apple. Two-way OAuth sync lands in Phase 5.
 */
function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export async function GET() {
  const { items } = await getCalendar();
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Farm 1893//Venue OS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:The Farm 1893 — Bookings",
  ];
  for (const it of items) {
    const start = it.date.replace(/-/g, "");
    // DTEND is exclusive in iCal, so add a day to the inclusive end date.
    const endDays = eachDay(it.date, it.endDate ?? it.date);
    const lastDay = new Date(endDays[endDays.length - 1] + "T00:00:00");
    lastDay.setDate(lastDay.getDate() + 1);
    const end = `${lastDay.getFullYear()}${String(lastDay.getMonth() + 1).padStart(2, "0")}${String(lastDay.getDate()).padStart(2, "0")}`;
    lines.push(
      "BEGIN:VEVENT",
      `UID:${esc(it.id)}@thefarm1893`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${esc(it.title)}`,
      `DESCRIPTION:${esc(`${it.kind} · ${it.resource}${it.detail ? ` · ${it.detail}` : ""}`)}`,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="the-farm-1893.ics"',
    },
  });
}
