import { Panel, StatCard } from "@/components/crm/widgets";
import { referrals, referralStats } from "@/lib/crm/growth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Share2, Users, CheckCircle2, DollarSign } from "lucide-react";

export const metadata = { title: "Referrals" };

const statusCls: Record<string, string> = {
  invited: "bg-ink/8 text-ink-soft",
  toured: "bg-brass/15 text-brass",
  booked: "bg-sage-deep text-parchment",
};

export default function ReferralsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Referrals</h1>
        <p className="mt-1 text-stone">Your happiest couples are your best marketers — this tracks every referral and reward.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active advocates" value={String(referralStats.activeAdvocates)} icon={Share2} accent="brass" />
        <StatCard label="Referred leads" value={String(referralStats.referredLeads)} icon={Users} accent="ink" />
        <StatCard label="Booked from referrals" value={String(referralStats.bookedFromReferrals)} icon={CheckCircle2} accent="sage" />
        <StatCard label="Referral revenue" value={formatCurrency(referralStats.revenueFromReferrals)} delta="+34%" icon={DollarSign} accent="sage" />
      </div>

      <div className="rounded-2xl border border-sage/30 bg-sage/8 p-5 text-sm text-ink-soft">
        <span className="font-medium text-ink">AI Copilot:</span> Referred couples close at nearly 2× your average and cost you nothing to acquire.
        Hannah Whitfield has referred 2 booked weddings — send her the free-anniversary-night reward to keep the flywheel spinning.
      </div>

      <Panel title="Referral activity" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-bone text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-5 py-3.5 font-medium">Advocate</th>
                <th className="px-5 py-3.5 font-medium">Referred</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Reward</th>
                <th className="px-5 py-3.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {referrals.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-stone">No referrals yet — share your ambassador link to start tracking them here.</td></tr>
              )}
              {referrals.map((r, i) => (
                <tr key={i} className="hover:bg-bone/60">
                  <td className="px-5 py-4 font-medium text-ink">{r.advocate}</td>
                  <td className="px-5 py-4 text-ink-soft">{r.referred}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusCls[r.status]}`}>{r.status}</span></td>
                  <td className="px-5 py-4 text-ink-soft">{r.reward}</td>
                  <td className="px-5 py-4 text-stone">{formatDate(r.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
