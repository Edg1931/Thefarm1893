import Link from "next/link";
import { Panel, StatCard } from "@/components/crm/widgets";
import { BookingsCalendar } from "@/components/crm/BookingsCalendar";
import { siloGuests, siloStats, silos } from "@/lib/silos";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Home, TrendingUp, Repeat, Star, Mail, Zap, CalendarDays } from "lucide-react";

export const metadata = { title: "Silo Stays (VRBO)" };

const statusCls: Record<string, string> = {
  upcoming: "bg-brass/15 text-brass",
  staying: "bg-sage-deep text-parchment",
  past: "bg-ink/8 text-ink-soft",
};

export default function RentalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Silo Stays · VRBO</h1>
        <p className="mt-1 text-stone">Your short-term rentals — separate from weddings, with their own guests, revenue, and re-engagement.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Occupancy rate" value={`${siloStats.occupancyRate}%`} delta="+6%" icon={TrendingUp} accent="sage" />
        <StatCard label="Rental revenue (MTD)" value={formatCurrency(siloStats.nightlyRevenueMTD)} delta="+19%" icon={Home} accent="brass" />
        <StatCard label="Repeat-guest rate" value={`${siloStats.repeatGuestRate}%`} icon={Repeat} accent="ink" />
        <StatCard label="Avg. rating" value={siloStats.avgRating.toFixed(2)} icon={Star} accent="terracotta" />
      </div>

      <div className="rounded-2xl border border-sage/30 bg-sage/8 p-5 text-sm text-ink-soft">
        <span className="flex items-center gap-2 font-medium text-ink"><Zap size={16} className="text-sage-deep" /> AI Copilot:</span>
        <p className="mt-1">Every silo guest is auto-tagged <b className="text-ink">VRBO</b> and enrolled in the <Link href="/dashboard/automations" className="text-brass hover:underline">Silo Stays — Come Back</Link> drip:
        a review request after checkout, then a "come back" nudge at 11 months. It&apos;s already re-booked <b className="text-ink">34 returning stays</b> this year. Rachel &amp; Mark and 2 other repeat guests are due for their annual invite.</p>
      </div>

      {/* Shared availability — silos + weddings so no day gets double-booked or left empty */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><CalendarDays size={20} className="text-brass" /> Availability · silos + weddings</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-brass hover:underline">Full calendar →</Link>
        </div>
        <BookingsCalendar />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Recent & upcoming guests" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone">
                <tr className="border-b border-ink/8">
                  <th className="pb-3 font-medium">Guest</th>
                  <th className="pb-3 font-medium">Silo</th>
                  <th className="pb-3 font-medium">Check-in</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Reach out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {siloGuests.map((g) => (
                  <tr key={g.id} className="hover:bg-bone/60">
                    <td className="py-3">
                      <p className="font-medium text-ink">{g.name} {g.repeat && <span className="ml-1 rounded-full bg-brass/15 px-2 py-0.5 text-[0.6rem] font-medium text-brass">Repeat</span>}</p>
                      <p className="text-xs text-stone">{g.email}</p>
                    </td>
                    <td className="py-3 text-ink-soft">{g.silo}</td>
                    <td className="py-3 text-ink-soft">{formatDate(g.checkIn)} · {g.nights}n</td>
                    <td className="py-3 font-medium text-ink">{formatCurrency(g.total)}</td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusCls[g.status]}`}>{g.status}</span></td>
                    <td className="py-3"><a href={`mailto:${g.email}`} className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><Mail size={14} /></a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Your silos">
          <div className="space-y-3">
            {silos.map((s) => (
              <div key={s.slug} className="flex items-center justify-between rounded-xl bg-bone p-3">
                <div>
                  <p className="text-sm font-medium text-ink">{s.name}</p>
                  <p className="text-xs text-stone">Sleeps {s.sleeps} · {formatCurrency(s.nightly)}/night</p>
                </div>
                <Link href={`/silos/${s.slug}`} target="_blank" className="text-xs font-medium text-brass hover:underline">View ↗</Link>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
