import Link from "next/link";
import { Panel, StatCard, InsightCard } from "@/components/crm/widgets";
import { funnel, trafficSources, dashboardStats, financials } from "@/lib/crm/sample-data";
import { analyticsInsights } from "@/lib/crm/growth";
import { formatCurrency } from "@/lib/utils";
import { Eye, Users, Route, Percent, Wallet, TrendingUp, PiggyBank, Landmark, ArrowUpRight, CircleDollarSign } from "lucide-react";

export const metadata = { title: "Analytics & Financials" };

const accentText: Record<string, string> = {
  sage: "text-sage-deep", terracotta: "text-terracotta", brass: "text-brass", ink: "text-ink",
};
const accentBar: Record<string, string> = {
  sage: "bg-sage-deep", terracotta: "bg-terracotta", brass: "bg-brass", ink: "bg-ink",
};

export default function AnalyticsPage() {
  const visitors = funnel[0].value;
  const leads = funnel[2].value;
  const leadRate = Math.round((leads / visitors) * 100);

  const totalStreams = financials.streams.reduce((s, r) => s + r.value, 0);
  const totalSpend = financials.marketingRoi.reduce((s, r) => s + r.spend, 0);
  const totalAttributed = financials.marketingRoi.reduce((s, r) => s + r.revenue, 0);
  const blendedRoi = Math.round(totalAttributed / totalSpend);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl text-ink">Analytics &amp; Financials</h1>
        <p className="mt-1 text-stone">The money, the marketing, and the funnel — with AI telling you what to do next.</p>
      </div>

      {/* ---- FINANCIALS ---- */}
      <section className="space-y-5">
        <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><Wallet size={20} className="text-brass" /> Financial overview</h2>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Booked revenue YTD" value={formatCurrency(financials.bookedRevenueYTD)} delta="+24%" icon={TrendingUp} accent="sage" />
          <StatCard label="Net profit YTD" value={formatCurrency(financials.netProfitYTD)} delta={`${financials.grossMarginPct}% margin`} icon={PiggyBank} accent="brass" />
          <StatCard label="Outstanding balances" value={formatCurrency(financials.outstandingBalances)} icon={Landmark} accent="terracotta" />
          <StatCard label="Deposits held" value={formatCurrency(financials.depositsHeld)} icon={CircleDollarSign} accent="ink" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Revenue streams */}
          <Panel title="Revenue by stream" action={<span className="text-sm text-stone">YTD · {formatCurrency(totalStreams)}</span>}>
            <div className="space-y-3.5">
              {financials.streams.map((r) => {
                const pct = Math.round((r.value / totalStreams) * 100);
                return (
                  <div key={r.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-soft">{r.label}</span>
                      <span className="font-medium text-ink">{formatCurrency(r.value)} <span className="text-xs text-stone">· {pct}%</span></span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-bone">
                      <div className={`h-full rounded-full ${accentBar[r.accent]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-ink/8 pt-4 text-center">
              <div><p className="font-display text-xl text-sage-deep">{formatCurrency(financials.collectedYTD)}</p><p className="text-xs text-stone">Collected</p></div>
              <div><p className="font-display text-xl text-ink">{formatCurrency(financials.pipelineValue)}</p><p className="text-xs text-stone">Open pipeline</p></div>
              <div><p className="font-display text-xl text-brass">{formatCurrency(financials.avgBookingValue)}</p><p className="text-xs text-stone">Avg. booking</p></div>
            </div>
          </Panel>

          {/* Upcoming billing */}
          <Panel title="Upcoming billing" action={<Link href="/dashboard/contracts" className="text-sm text-brass hover:underline">Contracts</Link>}>
            <ul className="space-y-2.5">
              {financials.upcomingBilling.map((b) => (
                <li key={b.client + b.label} className="flex items-center justify-between rounded-xl bg-bone p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{b.client}</p>
                    <p className="text-xs text-stone">{b.label} · due {new Date(b.due + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  <div className="ml-3 shrink-0 text-right">
                    <p className="font-medium text-ink">{formatCurrency(b.amount)}</p>
                    <span className={`text-[0.65rem] font-medium ${b.status === "overdue" ? "text-terracotta" : b.status === "due" ? "text-brass" : "text-stone"}`}>
                      {b.status === "overdue" ? "Overdue" : b.status === "due" ? "Due soon" : "Scheduled"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-brass/8 p-3 text-xs text-ink-soft">Auto-syncs to QuickBooks and reconciles against Stripe/Helcim once payments are connected.</p>
          </Panel>
        </div>

        {/* Marketing ROI */}
        <Panel title="Marketing ROI by channel" action={<span className="text-sm font-medium text-sage-deep">Blended {blendedRoi}× return</span>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone">
                <tr className="border-b border-ink/8">
                  <th className="pb-2.5 font-medium">Channel</th>
                  <th className="pb-2.5 font-medium">Spend</th>
                  <th className="pb-2.5 font-medium">Attributed revenue</th>
                  <th className="pb-2.5 font-medium">ROI</th>
                  <th className="pb-2.5 font-medium">Efficiency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {[...financials.marketingRoi].sort((a, b) => b.revenue / b.spend - a.revenue / a.spend).map((r) => {
                  const roi = r.revenue / r.spend;
                  const width = Math.min(100, Math.round((roi / 32) * 100));
                  return (
                    <tr key={r.channel} className="hover:bg-bone/60">
                      <td className="py-3 font-medium text-ink">{r.channel}</td>
                      <td className="py-3 text-ink-soft">{formatCurrency(r.spend)}</td>
                      <td className="py-3 text-ink-soft">{formatCurrency(r.revenue)}</td>
                      <td className="py-3"><span className="flex items-center gap-1 font-medium text-sage-deep"><ArrowUpRight size={14} /> {Math.round(roi)}×</span></td>
                      <td className="py-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-bone">
                          <div className="h-full rounded-full bg-gradient-to-r from-sage-deep to-sage" style={{ width: `${width}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-ink-soft">💡 Every <b className="text-ink">$1</b> in marketing returned <b className="text-ink">${blendedRoi}</b>. Organic/SEO and referrals are your cheapest channels — shift budget there.</p>
        </Panel>
      </section>

      {/* ---- TRAFFIC & FUNNEL ---- */}
      <section className="space-y-5">
        <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><Route size={20} className="text-brass" /> Traffic &amp; conversion</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Visitors this month" value={visitors.toLocaleString()} delta="+22%" icon={Eye} accent="ink" />
          <StatCard label="Leads captured" value={leads.toLocaleString()} delta="+18%" icon={Users} accent="sage" />
          <StatCard label="Visitor → lead" value={`${leadRate}%`} icon={Percent} accent="brass" />
          <StatCard label="Lead → booking" value={`${dashboardStats.conversionRate}%`} icon={Route} accent="terracotta" />
        </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Conversion funnel">
          <div className="space-y-2.5">
            {funnel.map((f) => {
              const pct = Math.round((f.value / funnel[0].value) * 100);
              return (
                <div key={f.stage} className="flex items-center gap-4">
                  <div className="w-36 shrink-0 text-sm text-ink-soft">{f.stage}</div>
                  <div className="h-8 flex-1 overflow-hidden rounded-lg bg-bone">
                    <div className="flex h-full items-center rounded-lg bg-gradient-to-r from-sage-deep to-sage px-3" style={{ width: `${Math.max(pct, 8)}%` }}>
                      <span className="font-display text-sm text-parchment">{f.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="Traffic sources">
          <div className="space-y-4">
            {trafficSources.map((s) => (
              <div key={s.source}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{s.source}</span>
                  <span className="font-medium text-ink">{s.pct}%</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-bone">
                  <div className="h-full rounded-full bg-brass" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-lg bg-sage/8 p-3 text-xs text-sage-deep">Live traffic is measured automatically via Vercel Analytics on the deployed site.</p>
        </Panel>
      </div>
      </section>

      {/* ---- AI INSIGHTS ---- */}
      <section>
        <h2 className="mb-3 font-display text-2xl text-ink">What your data is telling you</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {analyticsInsights.map((ins) => (
            <InsightCard key={ins.title} icon={ins.icon} tone={ins.tone} title={ins.title} body={ins.body} cta="Apply suggestion" />
          ))}
        </div>
      </section>
    </div>
  );
}
