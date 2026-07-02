import { Panel, StatCard } from "@/components/crm/widgets";
import { vendorRecords, vendorStats } from "@/lib/crm/sample-data";
import { formatCurrency } from "@/lib/utils";
import { Handshake, DollarSign, Send, Award, Star, Plus } from "lucide-react";

const tierCls: Record<string, string> = {
  preferred: "bg-brass/15 text-brass",
  featured: "bg-sage/15 text-sage-deep",
  listed: "bg-ink/8 text-ink-soft",
};
const statusCls: Record<string, string> = {
  active: "bg-sage/15 text-sage-deep",
  pending: "bg-brass/15 text-brass",
  review: "bg-terracotta/15 text-terracotta",
};

export default function VendorsCrmPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Vendor Network</h1>
          <p className="mt-1 text-stone">Your preferred-partner ecosystem — and a referral revenue stream.</p>
        </div>
        <button className="btn btn-primary !py-2.5 !text-xs"><Plus size={15} /> Invite Vendor</button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active partners" value={String(vendorStats.activePartners)} delta="+3" icon={Handshake} accent="ink" />
        <StatCard label="Referral revenue YTD" value={formatCurrency(vendorStats.referralRevenueYTD)} delta="+34%" icon={DollarSign} accent="brass" />
        <StatCard label="Membership revenue" value={formatCurrency(vendorStats.membershipRevenue)} delta="annual" icon={Award} accent="sage" />
        <StatCard label="Leads sent to vendors" value={String(vendorStats.totalReferrals)} delta="+28" icon={Send} accent="terracotta" />
      </div>

      <div className="rounded-2xl border border-brass/25 bg-brass/8 p-5 text-sm text-ink-soft">
        <span className="font-medium text-ink">AI Copilot:</span> Your vendor network generated{" "}
        <span className="font-medium text-ink">{formatCurrency(vendorStats.referralRevenueYTD + vendorStats.membershipRevenue)}</span>{" "}
        in passive revenue this year. Amberlight Photography converts 66% of referrals — consider a co-marketing
        campaign with them. Bluebird Bartending has been "pending" for 9 days; approve or decline to keep your roster fresh.
      </div>

      <Panel title="Partner roster" action={<span className="text-sm text-stone">Ranked by referral performance</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-stone">
              <tr className="border-b border-ink/8">
                <th className="pb-3 font-medium">Vendor</th>
                <th className="pb-3 font-medium">Tier</th>
                <th className="pb-3 font-medium">Referrals → Booked</th>
                <th className="pb-3 font-medium">Commission</th>
                <th className="pb-3 font-medium">Earned YTD</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {vendorRecords.map((v) => {
                const conv = v.referralsSent ? Math.round((v.bookedFromReferrals / v.referralsSent) * 100) : 0;
                return (
                  <tr key={v.id} className="hover:bg-bone/60">
                    <td className="py-3">
                      <p className="font-medium text-ink">{v.name}</p>
                      <p className="text-xs text-stone">{v.category}</p>
                    </td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tierCls[v.tier]}`}>{v.tier}</span></td>
                    <td className="py-3">
                      <p className="text-ink-soft">{v.referralsSent} → {v.bookedFromReferrals}</p>
                      {v.referralsSent > 0 && <p className="text-xs text-sage-deep">{conv}% conversion</p>}
                    </td>
                    <td className="py-3 text-ink-soft">{v.commissionRate}%</td>
                    <td className="py-3 font-medium text-ink">{formatCurrency(v.commissionEarnedYTD)}</td>
                    <td className="py-3">
                      {v.rating > 0 ? (
                        <span className="flex items-center gap-1 text-ink-soft"><Star size={13} className="fill-brass text-brass" /> {v.rating.toFixed(1)}</span>
                      ) : <span className="text-stone">—</span>}
                    </td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusCls[v.status]}`}>{v.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
