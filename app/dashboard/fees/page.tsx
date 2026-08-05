import { FeeSchedule } from "@/components/crm/FeeSchedule";
import { getFees } from "@/lib/crm/data";

export const metadata = { title: "Billable Fees" };

export default async function FeesPage() {
  const { feeTypes, charges, live } = await getFees();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Billable fees</h1>
        <p className="mt-1 max-w-2xl text-stone">
          Outside vendors, late checkouts, and extra walkthroughs — the revenue that's easiest to
          forget. Set the rates once, log the charge the day it happens, and add it to the invoice.
        </p>
      </div>
      <FeeSchedule feeTypes={feeTypes} charges={charges} live={live} />
    </div>
  );
}
