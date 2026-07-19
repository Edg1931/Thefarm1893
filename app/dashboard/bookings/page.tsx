import { BookingsCalendar } from "@/components/crm/BookingsCalendar";
import { getEvents, getSiloGuests } from "@/lib/crm/data";

export const metadata = { title: "Bookings & Calendar" };

export default async function BookingsPage() {
  const [{ events, live }, { guests }] = await Promise.all([getEvents(), getSiloGuests()]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Bookings &amp; Calendar</h1>
        <p className="mt-1 text-stone">Weddings, tentative holds, tours, and silo stays — all in one view.</p>
      </div>
      <BookingsCalendar events={events} guests={guests} live={live} />
    </div>
  );
}
