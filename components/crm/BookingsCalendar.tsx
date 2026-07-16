"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { upcomingEvents, bookedDates } from "@/lib/crm/sample-data";
import { siloGuests } from "@/lib/silos";
import { formatDate } from "@/lib/utils";

type CalEvent = { title: string; type: "wedding" | "tentative" | "tour" | "silo" };

const typeStyle: Record<string, string> = {
  wedding: "bg-sage-deep text-parchment",
  tentative: "bg-brass text-ink",
  tour: "bg-ink/50 text-parchment",
  silo: "bg-terracotta text-parchment",
};

function iso(d: Date) { return d.toISOString().slice(0, 10); }
function addDays(isoStr: string, n: number) {
  const d = new Date(isoStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
}

/** All events expanded to the individual ISO days they occupy. */
function buildEventMap(): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  const push = (day: string, ev: CalEvent) => map.set(day, [...(map.get(day) ?? []), ev]);

  for (const e of upcomingEvents) {
    const type = e.status === "confirmed" ? "wedding" : e.status === "tentative" ? "tentative" : "tour";
    push(e.date, { title: e.title, type });
  }
  for (const g of siloGuests) {
    for (let i = 0; i < g.nights; i++) {
      const first = g.name.split(" ")[0];
      push(addDays(g.checkIn, i), { title: `${g.silo.replace("The ", "")} · ${first}`, type: "silo" });
    }
  }
  return map;
}

export function BookingsCalendar() {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const events = useMemo(buildEventMap, []);
  const bookedSet = useMemo(() => new Set(bookedDates), []);

  const monthName = new Date(view.y, view.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function shift(delta: number) {
    setView((v) => {
      const m = v.m + delta;
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });
  }

  const todayIso = iso(now);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <Panel
        title={monthName}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => shift(-1)} aria-label="Previous month" className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><ChevronLeft size={16} /></button>
            <button onClick={() => setView({ y: now.getFullYear(), m: now.getMonth() })} className="rounded-lg bg-bone px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-linen">Today</button>
            <button onClick={() => shift(1)} aria-label="Next month" className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><ChevronRight size={16} /></button>
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap gap-3 text-xs">
          <Legend color="bg-sage-deep" label="Wedding" />
          <Legend color="bg-brass" label="Tentative" />
          <Legend color="bg-ink/50" label="Tour" />
          <Legend color="bg-terracotta" label="Silo Stay" />
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[0.7rem] uppercase tracking-wider text-stone">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="pb-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[78px]" />;
            const dayIso = iso(new Date(view.y, view.m, d));
            const evs = events.get(dayIso);
            const isBooked = bookedSet.has(dayIso);
            const isToday = dayIso === todayIso;
            return (
              <div key={i} className={`min-h-[78px] rounded-lg border p-1.5 text-left transition ${
                isToday ? "border-brass ring-1 ring-brass/40 bg-brass/5" : isBooked ? "border-sage/40 bg-sage/8" : "border-ink/8 bg-bone"
              }`}>
                <span className={`text-xs font-medium ${isToday ? "text-brass" : "text-ink-soft"}`}>{d}</span>
                <div className="mt-1 space-y-1">
                  {evs?.slice(0, 3).map((e, j) => (
                    <div key={j} className={`truncate rounded px-1 py-0.5 text-[0.58rem] font-medium ${typeStyle[e.type]}`}>{e.title}</div>
                  ))}
                  {evs && evs.length > 3 && <div className="px-1 text-[0.55rem] text-stone">+{evs.length - 3} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title="Upcoming">
        <ul className="space-y-3">
          {[...upcomingEvents].sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
            <li key={e.title} className="flex items-center gap-3 rounded-xl bg-bone p-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ink text-parchment">
                <span className="font-display text-base leading-none">{new Date(e.date).getDate()}</span>
                <span className="text-[0.5rem] uppercase">{new Date(e.date).toLocaleDateString("en-US", { month: "short" })}</span>
              </div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{e.title}</p><p className="text-xs text-stone">{e.type}</p></div>
              <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${e.status === "confirmed" ? "bg-sage/15 text-sage-deep" : e.status === "tentative" ? "bg-brass/15 text-brass" : "bg-ink/8 text-ink-soft"}`}>{e.status}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl border border-terracotta/25 bg-terracotta/8 p-4 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5 font-medium text-ink"><CalendarDays size={15} className="text-terracotta" /> Silo stays now on the calendar</span>
          <p className="mt-1">Wedding events and VRBO silo bookings share one view, so you&apos;ll never double-book the property.</p>
        </div>
      </Panel>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-stone"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}</span>;
}
