import { BookingsCalendar } from "@/components/crm/BookingsCalendar";
import { getEvents, getSiloGuests, getCalendar } from "@/lib/crm/data";

export const metadata = { title: "Bookings & Calendar" };

export default async function BookingsPage() {
  const [{ events, live }, { guests }, { blocks }] = await Promise.all([getEvents(), getSiloGuests(), getCalendar()]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-ink">Bookings &amp; Calendar</h1>
          <p className="mt-1 text-stone">Weddings, tentative holds, tours, silo stays, and blocked dates — one source of truth.</p>
        </div>
        <a href="/api/calendar/ical" className="btn btn-ghost !py-2 !text-xs" title="Subscribe in Google, Outlook, or Apple Calendar">Subscribe (.ics) →</a>
      </div>
      <BookingsCalendar events={events} guests={guests} blocks={blocks} live={live} />
    </div>
  );
}
