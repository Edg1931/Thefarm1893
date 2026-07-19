import Link from "next/link";
import { DollarSign, Users, Zap, TrendingUp, CalendarDays } from "lucide-react";
import { StatCard, InsightCard, RevenueChart, ScoreRing, Panel } from "@/components/crm/widgets";
import { BookingsCalendar } from "@/components/crm/BookingsCalendar";
import { revenueByMonth, aiInsights, funnel, trafficSources } from "@/lib/crm/sample-data";
import { getDashboardData, getEvents, getSiloGuests } from "@/lib/crm/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardOverview() {
  const [{ leads, stats: dashboardStats, live }, { events }, { guests }] = await Promise.all([
    getDashboardData(), getEvents(), getSiloGuests(),
  ]);
  const hot = leads.filter((l) => l.priority === "hot" && l.stage !== "booked").slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Greeting + AI copilot line */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Good morning, Farm Team 🌾</h1>
          <p className="mt-1 text-stone">Here's what your AI copilot noticed overnight.</p>
        </div>
        <Link href="/dashboard/leads" className="btn btn-primary !py-3">View Pipeline</Link>
      </div>

      {/* AI Insights strip */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {aiInsights.map((ins) => (
          <InsightCard key={ins.title} {...ins} />
        ))}
      </div>

      {/* KPIs */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pipeline value" value={formatCurrency(dashboardStats.pipelineValue)} delta="+18%" icon={DollarSign} accent="brass" />
        <StatCard label="Booked revenue YTD" value={formatCurrency(dashboardStats.bookedRevenueYTD)} delta="+24%" icon={TrendingUp} accent="sage" />
        <StatCard label="New leads this month" value={String(dashboardStats.leadsThisMonth)} delta="+9" icon={Users} accent="ink" />
        <StatCard label="Avg. response time" value={`${dashboardStats.avgResponseMins} min`} delta="Fast" icon={Zap} accent="terracotta" />
      </div>

      {/* Availability calendar — weddings + silos + AI open-date suggestions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><CalendarDays size={20} className="text-brass" /> Availability at a glance</h2>
          <Link href="/dashboard/bookings" className="text-sm font-medium text-brass hover:underline">Full calendar →</Link>
        </div>
        <BookingsCalendar events={events} guests={guests} live={live} />
      </div>

      {/* Revenue chart */}
      <Panel title="Revenue & bookings"
        action={<span className="text-sm text-stone">This year · in thousands</span>}>
        <RevenueChart data={revenueByMonth} />
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-ink/8 pt-5 text-center">
          <div><p className="font-display text-2xl text-ink">{dashboardStats.conversionRate}%</p><p className="text-xs text-stone">Lead → booking</p></div>
          <div><p className="font-display text-2xl text-ink">{dashboardStats.toursScheduled}</p><p className="text-xs text-stone">Tours scheduled</p></div>
          <div><p className="font-display text-2xl text-ink">{formatCurrency(19800)}</p><p className="text-xs text-stone">Avg. booking value</p></div>
        </div>
      </Panel>

      {/* Website funnel + traffic */}
      <div className="grid gap-8 xl:grid-cols-3">
        <Panel title="Website funnel" className="xl:col-span-2"
          action={<span className="text-sm text-stone">Visitors → weddings · this month</span>}>
          <div className="space-y-2.5">
            {funnel.map((f, i) => {
              const pct = Math.round((f.value / funnel[0].value) * 100);
              return (
                <div key={f.stage} className="flex items-center gap-4">
                  <div className="w-40 shrink-0 text-sm text-ink-soft">{f.stage}</div>
                  <div className="relative h-9 flex-1 overflow-hidden rounded-lg bg-bone">
                    <div className="flex h-full items-center rounded-lg bg-gradient-to-r from-sage-deep to-sage px-3" style={{ width: `${Math.max(pct, 8)}%` }}>
                      <span className="font-display text-sm text-parchment">{f.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="hidden w-28 shrink-0 text-right text-xs text-stone sm:block">{f.note}</div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Where they come from">
          <div className="space-y-3">
            {trafficSources.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{s.source}</span>
                  <span className="font-medium text-ink">{s.pct}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-bone">
                  <div className="h-full rounded-full bg-brass" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-stone">The new Journal &amp; SEO work targets the organic-search channel.</p>
        </Panel>
      </div>

      {/* Hot leads needing attention */}
      <Panel title="🔥 Hot leads to close"
        action={<Link href="/dashboard/leads" className="text-sm text-brass hover:underline">All leads</Link>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-stone">
              <tr className="border-b border-ink/8">
                <th className="pb-3 font-medium">Score</th>
                <th className="pb-3 font-medium">Lead</th>
                <th className="pb-3 font-medium">Event</th>
                <th className="pb-3 font-medium">Value</th>
                <th className="pb-3 font-medium">AI recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {hot.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-sm text-stone">No hot leads right now — new high-intent inquiries will surface here.</td></tr>
              )}
              {hot.map((l) => (
                <tr key={l.id} className="group transition hover:bg-bone/60">
                  <td className="py-3"><ScoreRing score={l.score} /></td>
                  <td className="py-3">
                    <p className="font-medium text-ink">{l.name}</p>
                    <p className="text-xs text-stone">{l.source} · {l.lastActivity}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-ink-soft">{l.eventType}</p>
                    <p className="text-xs text-stone">{formatDate(l.eventDate)} · {l.guestCount} guests</p>
                  </td>
                  <td className="py-3 font-medium text-ink">{formatCurrency(l.budget)}</td>
                  <td className="max-w-xs py-3 text-xs text-ink-soft">{l.aiSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
