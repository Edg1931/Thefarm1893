"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, Sparkles, X, Home as HomeIcon, Heart, MapPin } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { upcomingEvents, bookedDates, type BookingEvent } from "@/lib/crm/sample-data";
import { siloGuests, type SiloGuest } from "@/lib/silos";
import { sampleBlocks, blockDays, type AvailabilityBlock } from "@/lib/crm/calendar";
import { formatDate } from "@/lib/utils";
import { Wrench } from "lucide-react";

type EvType = "wedding" | "tentative" | "tour" | "silo" | "block";
type CalEvent = { title: string; type: EvType; subtitle?: string };

const typeStyle: Record<string, string> = {
  wedding: "bg-sage-deep text-parchment",
  tentative: "bg-brass text-ink",
  tour: "bg-ink/50 text-parchment",
  silo: "bg-terracotta text-parchment",
  block: "bg-stone/70 text-parchment",
};
const typeLabel: Record<EvType, string> = { wedding: "Wedding", tentative: "Tentative hold", tour: "Tour", silo: "Silo stay", block: "Blocked" };
const typeIcon: Record<EvType, typeof Heart> = { wedding: Heart, tentative: CalendarDays, tour: MapPin, silo: HomeIcon, block: Wrench };

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function addDays(isoStr: string, n: number) {
  const d = new Date(isoStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
}

/** All events expanded to the individual ISO days they occupy. */
function buildEventMap(evts: BookingEvent[], guests: SiloGuest[], blocks: AvailabilityBlock[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  const push = (day: string, ev: CalEvent) => map.set(day, [...(map.get(day) ?? []), ev]);

  for (const e of evts) {
    const type: EvType = e.status === "confirmed" ? "wedding" : e.status === "tentative" ? "tentative" : "tour";
    push(e.date, { title: e.title, type, subtitle: e.type });
  }
  for (const g of guests) {
    for (let i = 0; i < g.nights; i++) {
      const first = g.name.split(" ")[0];
      push(addDays(g.checkIn, i), {
        title: `${g.silo.replace("The ", "")} · ${first}`,
        type: "silo",
        subtitle: `${g.silo} · night ${i + 1}/${g.nights}`,
      });
    }
  }
  for (const b of blocks) {
    const where = b.resourceSlug === "venue" ? "Venue" : b.resourceSlug.replace(/-/g, " ").replace(/\bsilo\b/i, "Silo");
    for (const day of blockDays(b)) {
      push(day, { title: b.reason || "Blocked", type: "block", subtitle: `${where} · ${b.source}` });
    }
  }
  return map;
}

export function BookingsCalendar({
  events: evts = upcomingEvents, guests = siloGuests, blocks = sampleBlocks, live = false,
}: { events?: BookingEvent[]; guests?: SiloGuest[]; blocks?: AvailabilityBlock[]; live?: boolean } = {}) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [selected, setSelected] = useState<string | null>(null);
  const events = useMemo(() => buildEventMap(evts, guests, blocks), [evts, guests, blocks]);
  const upcoming = evts;
  const bookedSet = useMemo(
    () => (live ? new Set(evts.filter((e) => e.status === "confirmed").map((e) => e.date)) : new Set(bookedDates)),
    [live, evts]
  );

  const monthName = new Date(view.y, view.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const firstDay = new Date(view.y, view.m, 1).getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const todayIso = iso(now);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function shift(delta: number) {
    setSelected(null);
    setView((v) => {
      const m = v.m + delta;
      return { y: v.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });
  }

  // AI: open Saturdays this month with no wedding/tentative hold (prime dates to fill).
  const openWeekends = useMemo(() => {
    const out: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(view.y, view.m, d);
      const dayIso = iso(date);
      if (date.getDay() !== 6) continue; // Saturdays
      if (dayIso < todayIso) continue;
      const evs = events.get(dayIso) ?? [];
      const hasWedding = evs.some((e) => e.type === "wedding" || e.type === "tentative");
      if (!hasWedding) out.push(dayIso);
    }
    return out;
  }, [view, daysInMonth, events, todayIso]);

  const selectedEvents = selected ? events.get(selected) ?? [] : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
      <Panel
        title={monthName}
        action={
          <div className="flex items-center gap-2">
            <button onClick={() => shift(-1)} aria-label="Previous month" className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><ChevronLeft size={16} /></button>
            <button onClick={() => { setView({ y: now.getFullYear(), m: now.getMonth() }); setSelected(null); }} className="rounded-lg bg-bone px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-linen">Today</button>
            <button onClick={() => shift(1)} aria-label="Next month" className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><ChevronRight size={16} /></button>
          </div>
        }
      >
        <div className="mb-3 flex flex-wrap gap-3 text-xs">
          <Legend color="bg-sage-deep" label="Wedding" />
          <Legend color="bg-brass" label="Tentative" />
          <Legend color="bg-ink/50" label="Tour" />
          <Legend color="bg-terracotta" label="Silo Stay" />
          <Legend color="bg-stone/70" label="Blocked" />
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center text-[0.7rem] uppercase tracking-wider text-stone">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="pb-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[78px]" />;
            const date = new Date(view.y, view.m, d);
            const dayIso = iso(date);
            const evs = events.get(dayIso);
            const isBooked = bookedSet.has(dayIso);
            const isToday = dayIso === todayIso;
            const isSelected = dayIso === selected;
            const isOpenWeekend = openWeekends.includes(dayIso);
            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : dayIso)}
                className={`min-h-[78px] rounded-lg border p-1.5 text-left transition hover:border-brass/50 ${
                  isSelected ? "border-brass ring-2 ring-brass/40 bg-brass/5"
                  : isToday ? "border-brass ring-1 ring-brass/40 bg-brass/5"
                  : isBooked ? "border-sage/40 bg-sage/8"
                  : "border-ink/8 bg-bone"
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${isToday ? "text-brass" : "text-ink-soft"}`}>{d}</span>
                  {isOpenWeekend && <span title="Open Saturday — prime date to fill" className="h-1.5 w-1.5 rounded-full bg-terracotta" />}
                </span>
                <span className="mt-1 block space-y-1">
                  {evs?.slice(0, 3).map((e, j) => (
                    <span key={j} className={`block truncate rounded px-1 py-0.5 text-[0.58rem] font-medium ${typeStyle[e.type]}`}>{e.title}</span>
                  ))}
                  {evs && evs.length > 3 && <span className="block px-1 text-[0.55rem] text-stone">+{evs.length - 3} more</span>}
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="space-y-6">
        {/* Selected-day detail */}
        {selected && (
          <Panel
            title={new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            action={<button onClick={() => setSelected(null)} aria-label="Close day" className="grid h-7 w-7 place-items-center rounded-lg bg-bone text-stone hover:bg-linen"><X size={15} /></button>}
          >
            {selectedEvents && selectedEvents.length > 0 ? (
              <ul className="space-y-2.5">
                {selectedEvents.map((e, i) => {
                  const Icon = typeIcon[e.type];
                  return (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-bone p-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${typeStyle[e.type]}`}><Icon size={16} /></span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{e.title}</p>
                        <p className="text-xs text-stone">{e.subtitle ?? typeLabel[e.type]}</p>
                      </div>
                      <span className="ml-auto shrink-0 rounded-full bg-parchment px-2 py-0.5 text-[0.62rem] font-medium text-ink-soft">{typeLabel[e.type]}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="rounded-xl border border-terracotta/25 bg-terracotta/8 p-4">
                <p className="flex items-center gap-1.5 text-sm font-medium text-ink"><Sparkles size={15} className="text-terracotta" /> Open date</p>
                <p className="mt-1 text-sm text-ink-soft">Nothing booked. {new Date(selected + "T00:00:00").getDay() === 6 ? "A Saturday this open is prime — " : ""}have AI spin up a promo to fill it.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/dashboard/marketing" className="btn btn-primary !py-2 !px-3 !text-xs"><Sparkles size={13} /> Generate promo</Link>
                  <Link href="/dashboard/leads" className="btn btn-ghost !py-2 !px-3 !text-xs">Offer to a lead</Link>
                </div>
              </div>
            )}
          </Panel>
        )}

        {/* AI: fill open weekends */}
        <Panel title="AI · Fill your open dates">
          {openWeekends.length > 0 ? (
            <>
              <p className="text-sm text-ink-soft">
                <b className="text-ink">{openWeekends.length}</b> open Saturday{openWeekends.length > 1 ? "s" : ""} in {monthName.split(" ")[0]} with no wedding booked. Every filled Saturday is ~{`$19,800`} in revenue.
              </p>
              <ul className="mt-3 space-y-2">
                {openWeekends.slice(0, 4).map((d) => (
                  <li key={d} className="flex items-center justify-between rounded-xl bg-bone p-3">
                    <span className="flex items-center gap-2 text-sm text-ink">
                      <span className="h-2 w-2 rounded-full bg-terracotta" />
                      {new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <Link href="/dashboard/marketing" className="text-xs font-medium text-brass hover:underline">Fill it →</Link>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/marketing" className="btn btn-primary mt-4 w-full !py-2.5 !text-xs"><Sparkles size={14} /> Generate a "fill-the-date" campaign</Link>
            </>
          ) : (
            <p className="rounded-xl bg-sage/10 p-4 text-sm text-sage-deep">🎉 Every Saturday this month is spoken for. Nicely done.</p>
          )}
        </Panel>

        <Panel title="Upcoming">
          <ul className="space-y-3">
            {upcoming.length === 0 && <li className="rounded-xl bg-bone p-4 text-center text-sm text-stone">No upcoming events yet.</li>}
            {[...upcoming].sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
              <li key={e.title + e.date} className="flex items-center gap-3 rounded-xl bg-bone p-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-ink text-parchment">
                  <span className="font-display text-base leading-none">{new Date(e.date + "T00:00:00").getDate()}</span>
                  <span className="text-[0.5rem] uppercase">{new Date(e.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}</span>
                </div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink">{e.title}</p><p className="text-xs text-stone">{e.type}</p></div>
                <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${e.status === "confirmed" ? "bg-sage/15 text-sage-deep" : e.status === "tentative" ? "bg-brass/15 text-brass" : "bg-ink/8 text-ink-soft"}`}>{e.status}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-1.5 text-stone"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /> {label}</span>;
}
