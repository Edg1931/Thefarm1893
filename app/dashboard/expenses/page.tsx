import { ExpenseLedger } from "@/components/crm/ExpenseLedger";
import { getExpenses } from "@/lib/crm/data";

export const metadata = { title: "Expenses" };

export default async function ExpensesPage() {
  const { expenses, live } = await getExpenses();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Expenses</h1>
        <p className="mt-1 max-w-2xl text-stone">
          Categorise each cost once, when it happens. Turnover labour books itself the moment a
          clean is finished, and the whole year exports to QuickBooks in one click.
        </p>
      </div>
      <ExpenseLedger initial={expenses} live={live} />
    </div>
  );
}
