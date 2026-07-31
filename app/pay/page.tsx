import { Wallet } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
import { PayButton } from "@/components/site/PayButton";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Make a Payment", robots: { index: false } };

/**
 * Shared, guest-facing payment page. Couples share a link here (e.g. from the
 * cost planner to let a guest pay for their room); the guest lands on a branded
 * page and pays via Stripe (or the demo flow). Amount/label come from the query.
 */
export default async function PayPage({ searchParams }: { searchParams: Promise<{ amount?: string; item?: string; kind?: string }> }) {
  const { amount, item, kind } = await searchParams;
  const dollars = Math.max(0, Number(amount) || 0);
  const label = item?.trim() || "The Farm 1893";

  return (
    <PortalShell title="Complete your payment" subtitle="Secure checkout for The Farm 1893.">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl bg-ink p-6 text-parchment">
          <p className="flex items-center gap-2 text-sm text-brass-soft"><Wallet size={16} /> {label}</p>
          <p className="mt-2 font-display text-4xl">{dollars > 0 ? formatCurrency(dollars) : "Enter amount at checkout"}</p>
          <p className="mt-1 text-sm text-parchment/60">Paid securely by card, Apple&nbsp;Pay, or Google&nbsp;Pay.</p>
          <div className="mt-5">
            {dollars > 0 ? (
              <PayButton amount={dollars} description={label} kind={kind ?? "room"} label="Pay now" className="btn bg-parchment text-ink" />
            ) : (
              <p className="text-sm text-parchment/70">This payment link is missing an amount. Please ask for an updated link.</p>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-stone">Questions about your payment? Reach out to the couple or the Farm — we&apos;re happy to help.</p>
      </div>
    </PortalShell>
  );
}
