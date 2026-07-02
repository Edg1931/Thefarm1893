import { Panel } from "@/components/crm/widgets";
import { upcomingEvents, bookedDates } from "@/lib/crm/sample-data";
import { formatDate } from "@/lib/utils";

const YEAR = 2026;
const MONTH = 6; // July (0-indexed)
const MONTH_NAME = "July 2026";

function buildCalendar() {
  const first = new Date(YEAR, MONTH, 1).getDay();
  const days = new Date(YEAR, MONTH + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  return cells;
}

export default function BookingsPage() {
  const cells = buildCalendar();
  const eventsByDay = new Map<number, typeof upcomingEvents>();
  for (const e of upcomingEvents) {
    const d = new Date(e.date);
    if (d.getFullYear() === YEAR && d.getMonth() === MONTH) {
      const day = d.getDate();
      eventsByDay.set(day, [...(eventsByDay.get(day) ?? []), e]);
    }
  }
  const bookedSet = new Set(bookedDates.filter((d) => d.startsWith("2026-07")).map((d) => Number(d.slice(-2))));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Bookings &amp; Calendar</h1>
        <p className="mt-1 text-stone">Confirmed events, tentative holds, and scheduled tours at a glance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title={MONTH_NAME}
          action={<div className="flex gap-3 text-xs">
            <Legend color="bg-sage-deep" label="Confirmed" />
            <Legend color="bg-brass" label="Tentative" />
            <Legend color="bg-ink/40" label="Tour" />
          </div>}>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[0.7rem] uppercase tracking-wider text-stone">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="pb-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((d, i) => {
              const evs = d ? eventsByDay.get(d) : undefined;
              const isBooked = d ? bookedSet.has(d) : false;
              return (
                <div key={i} className={`min-h-[74px] rounded-lg border p-1.5 text-left ${
                  d ? (isBooked ? "border-sage/40 bg-sage/8" : "border-ink/8 bg-bone") : "border-transparent"
                }`}>
                  {d && <span className="text-xs font-medium text-ink-soft">{d}</span>}
                  <div className="mt-1 space-y-1">
                    {evs?.map((e) => (
                      <div key={e.title} className={`truncate rounded px-1 py-0.5 text-[0.6rem] font-medium text-parchment ${
                        e.status === "confirmed" ? "bg-sage-deep" : e.status === "tentative" ? "bg-brass" : "bg-ink/50"
                      }`}>{e.title}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Event list">
          <ul className="space-y-3">
            {[...upcomingEvents].sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
              <li key={e.title} className="flex items-center justify-between rounded-xl bg-bone p-3">
                <div>
                  <p className="text-sm font-medium text-ink">{e.title}</p>
                  <p className="text-xs text-stone">{formatDate(e.date)} · {e.type}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${
                  e.status === "confirmed" ? "bg-sage/15 text-sage-deep" :
                  e.status === "tentative" ? "bg-brass/15 text-brass" : "bg-ink/8 text-ink-soft"
                }`}>{e.status}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-sage/30 bg-sage/8 p-4 text-sm text-ink-soft">
            <span className="font-medium text-ink">AI tip:</span> You have 3 open Saturdays in July. Launch a “last-minute summer” promo from the Marketing Studio to fill them.
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-stone"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}</span>;
}
