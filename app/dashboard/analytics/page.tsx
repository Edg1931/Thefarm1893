import { Panel, StatCard, InsightCard } from "@/components/crm/widgets";
import { funnel, trafficSources, dashboardStats } from "@/lib/crm/sample-data";
import { analyticsInsights } from "@/lib/crm/growth";
import { formatCurrency } from "@/lib/utils";
import { Eye, Users, Route, Percent } from "lucide-react";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  const visitors = funnel[0].value;
  const leads = funnel[2].value;
  const leadRate = Math.round((leads / visitors) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Analytics</h1>
        <p className="mt-1 text-stone">Where your traffic comes from, how it converts, and what to do about it.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visitors this month" value={visitors.toLocaleString()} delta="+22%" icon={Eye} accent="ink" />
        <StatCard label="Leads captured" value={leads.toLocaleString()} delta="+18%" icon={Users} accent="sage" />
        <StatCard label="Visitor → lead" value={`${leadRate}%`} icon={Percent} accent="brass" />
        <StatCard label="Lead → booking" value={`${dashboardStats.conversionRate}%`} icon={Route} accent="terracotta" />
      </div>

      {/* AI insights loop */}
      <div>
        <h2 className="mb-3 font-display text-2xl text-ink">What your data is telling you</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {analyticsInsights.map((ins) => (
            <InsightCard key={ins.title} icon={ins.icon} tone={ins.tone} title={ins.title} body={ins.body} cta="Apply suggestion" />
          ))}
        </div>
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

      <Panel title="Estimated revenue influence by channel">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { c: "Organic search", v: 148000 },
            { c: "Instagram", v: 96000 },
            { c: "The Knot / referrals", v: 121000 },
          ].map((r) => (
            <div key={r.c} className="rounded-xl bg-bone p-5">
              <p className="text-xs uppercase tracking-wider text-stone">{r.c}</p>
              <p className="mt-1 font-display text-2xl text-ink">{formatCurrency(r.v)}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
