import { Panel, StatCard } from "@/components/crm/widgets";
import { contracts } from "@/lib/crm/growth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileSignature, DollarSign, Clock, Plus, PenLine } from "lucide-react";

export const metadata = { title: "Contracts & Deposits" };

const statusCls: Record<string, string> = {
  draft: "bg-ink/8 text-ink-soft",
  sent: "bg-brass/15 text-brass",
  signed: "bg-sage/15 text-sage-deep",
  paid: "bg-sage-deep text-parchment",
};

export default function ContractsPage() {
  const signedValue = contracts.filter((c) => c.status === "signed" || c.status === "paid").reduce((s, c) => s + c.value, 0);
  const depositsCollected = contracts.filter((c) => c.depositPaid).reduce((s, c) => s + c.deposit, 0);
  const awaiting = contracts.filter((c) => c.status === "sent").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Contracts &amp; Deposits</h1>
          <p className="mt-1 text-stone">Send, e-sign, and collect deposits — no paperwork, no chasing.</p>
        </div>
        <button className="btn btn-primary !py-2.5 !text-xs"><Plus size={15} /> New Contract</button>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Signed contract value" value={formatCurrency(signedValue)} icon={FileSignature} accent="sage" />
        <StatCard label="Deposits collected" value={formatCurrency(depositsCollected)} icon={DollarSign} accent="brass" />
        <StatCard label="Awaiting signature" value={String(awaiting)} icon={Clock} accent="terracotta" />
      </div>

      <Panel title="All contracts" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-bone text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-5 py-3.5 font-medium">Contract</th>
                <th className="px-5 py-3.5 font-medium">Event</th>
                <th className="px-5 py-3.5 font-medium">Value</th>
                <th className="px-5 py-3.5 font-medium">Deposit</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-bone/60">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{c.client}</p>
                    <p className="text-xs text-stone">{c.id}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-ink-soft">{c.event}</p>
                    <p className="text-xs text-stone">{formatDate(c.date)}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-ink">{formatCurrency(c.value)}</td>
                  <td className="px-5 py-4">
                    <p className="text-ink-soft">{formatCurrency(c.deposit)}</p>
                    <p className={`text-xs ${c.depositPaid ? "text-sage-deep" : "text-terracotta"}`}>{c.depositPaid ? "Paid" : "Unpaid"}</p>
                  </td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusCls[c.status]}`}>{c.status}</span></td>
                  <td className="px-5 py-4">
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-brass hover:underline">
                      <PenLine size={14} /> {c.status === "draft" ? "Send" : c.status === "sent" ? "Remind" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="text-center text-xs text-stone">E-signature &amp; deposit collection go live when Stripe is connected. Contracts auto-generate from each client&apos;s AI proposal.</p>
    </div>
  );
}
