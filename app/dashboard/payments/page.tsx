import Link from "next/link";
import { Panel, StatCard } from "@/components/crm/widgets";
import { InvoiceBuilder } from "@/components/crm/InvoiceBuilder";
import { getPayments, getInvoices } from "@/lib/crm/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CreditCard, DollarSign, Receipt, TrendingUp, FileText } from "lucide-react";

export const metadata = { title: "Payments" };

const invStatusCls: Record<string, string> = {
  draft: "bg-ink/8 text-ink-soft",
  sent: "bg-brass/15 text-brass",
  paid: "bg-sage-deep text-parchment",
  overdue: "bg-terracotta/15 text-terracotta",
  void: "bg-ink/8 text-stone",
};

export default async function PaymentsPage() {
  const [{ payments, live, collected }, { invoices, outstanding }] = await Promise.all([getPayments(), getInvoices()]);
  const paidCount = payments.filter((p) => p.status === "paid").length;
  const avg = paidCount ? Math.round(collected / paidCount) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Payments &amp; Invoicing</h1>
        <p className="mt-1 text-stone">Deposits, installments, and balances — by card, Apple/Google&nbsp;Pay, or bank (ACH), auto-logged as they clear.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <StatCard label="Collected" value={formatCurrency(collected)} icon={DollarSign} accent="sage" />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} icon={FileText} accent="terracotta" />
        <StatCard label="Transactions" value={String(paidCount)} icon={Receipt} accent="brass" />
        <StatCard label="Average payment" value={formatCurrency(avg)} icon={TrendingUp} accent="ink" />
      </div>

      {/* Invoices & installments */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Invoices & installments" className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-bone text-xs uppercase tracking-wider text-stone">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Invoice</th>
                  <th className="px-5 py-3.5 font-medium">Due</th>
                  <th className="px-5 py-3.5 font-medium">Amount</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {invoices.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-stone">No invoices yet — build a payment plan to get started.</td></tr>}
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-bone/60">
                    <td className="px-5 py-4"><p className="font-medium text-ink">{inv.label}</p><p className="text-xs text-stone">{inv.id}</p></td>
                    <td className="px-5 py-4 text-ink-soft">{inv.dueDate ? formatDate(inv.dueDate) : "—"}</td>
                    <td className="px-5 py-4 font-medium text-ink">{formatCurrency(inv.amount)}</td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${invStatusCls[inv.status]}`}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <InvoiceBuilder />
      </div>

      {!live && (
        <div className="rounded-2xl border border-brass/25 bg-brass/8 p-4 text-sm text-ink-soft">
          <span className="font-medium text-ink">Demo data.</span> Connect Stripe (Integrations → Stripe) and real deposits, balances, and silo-stay payments will appear here automatically as they clear.
        </div>
      )}

      <Panel title="Transactions" className="!p-0 overflow-hidden"
        action={<Link href="/dashboard/settings" className="pr-6 text-sm text-brass hover:underline">Stripe settings</Link>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-bone text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-5 py-3.5 font-medium">Date</th>
                <th className="px-5 py-3.5 font-medium">Amount</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {payments.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-stone">No payments yet — they&apos;ll appear here the moment a checkout clears.</td></tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-bone/60">
                  <td className="px-5 py-4 text-ink-soft">{p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                  <td className="px-5 py-4 font-medium text-ink">{formatCurrency(p.amount)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${p.status === "paid" ? "bg-sage/15 text-sage-deep" : "bg-brass/15 text-brass"}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-stone">{p.stripeId ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-stone">
        <CreditCard size={13} /> Payments reconcile automatically via the Stripe webhook. QuickBooks export is a flip away.
      </p>
    </div>
  );
}
