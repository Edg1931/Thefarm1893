/* ============================================================================
   EXPENSES — the "cut accounting from a day to two hours a week" piece.

   The goal from the owner's notes isn't fancy bookkeeping; it's that every
   dollar leaving the farm gets categorised *once*, at the moment it's spent,
   in a shape the accountant can import. So: fixed categories that map cleanly
   onto QuickBooks/Schedule-C accounts, a receipt path, and a CSV export that
   QuickBooks accepts without hand-editing.
   ============================================================================ */

export type ExpenseCategory =
  | "cleaning" | "maintenance" | "supplies" | "payroll"
  | "marketing" | "utilities" | "insurance" | "other";

export type Expense = {
  id: string;
  incurredOn: string;          // YYYY-MM-DD
  category: ExpenseCategory;
  vendor: string;
  description: string;
  amount: number;
  receiptPath?: string;        // private `documents` bucket
  taxDeductible: boolean;
};

/**
 * Category → the account name QuickBooks expects on import. Getting this right
 * once here is what removes the manual re-coding step at tax time.
 */
export const QB_ACCOUNT: Record<ExpenseCategory, string> = {
  cleaning:    "Contract Labor:Cleaning",
  maintenance: "Repairs & Maintenance",
  supplies:    "Supplies",
  payroll:     "Payroll Expenses",
  marketing:   "Advertising & Marketing",
  utilities:   "Utilities",
  insurance:   "Insurance",
  other:       "Other Business Expenses",
};

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  cleaning: "Cleaning & turnover",
  maintenance: "Repairs & maintenance",
  supplies: "Supplies & restocking",
  payroll: "Payroll",
  marketing: "Marketing",
  utilities: "Utilities",
  insurance: "Insurance",
  other: "Other",
};

export const categories = Object.keys(CATEGORY_LABEL) as ExpenseCategory[];

/* ---- reporting ------------------------------------------------------------ */

export function totalsByCategory(rows: Expense[]): { category: ExpenseCategory; total: number; count: number }[] {
  const m = new Map<ExpenseCategory, { total: number; count: number }>();
  for (const e of rows) {
    const cur = m.get(e.category) ?? { total: 0, count: 0 };
    m.set(e.category, { total: cur.total + e.amount, count: cur.count + 1 });
  }
  return [...m.entries()]
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.total - a.total);
}

export function totalsByMonth(rows: Expense[]): { month: string; total: number }[] {
  const m = new Map<string, number>();
  for (const e of rows) {
    const key = e.incurredOn.slice(0, 7);
    m.set(key, (m.get(key) ?? 0) + e.amount);
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([month, total]) => ({ month, total }));
}

const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/**
 * QuickBooks-ready CSV. Column names and order match QuickBooks Online's
 * "Bank/Expense" import template, so it imports without remapping.
 */
export function toQuickBooksCsv(rows: Expense[]): string {
  const header = ["Date", "Description", "Payee", "Account", "Amount", "Tax Deductible"];
  const lines = rows.map((e) =>
    [
      // QBO wants MM/DD/YYYY, not ISO.
      e.incurredOn ? e.incurredOn.slice(5, 7) + "/" + e.incurredOn.slice(8, 10) + "/" + e.incurredOn.slice(0, 4) : "",
      esc(e.description || CATEGORY_LABEL[e.category]),
      esc(e.vendor || ""),
      esc(QB_ACCOUNT[e.category]),
      // Money out is negative in the bank-import format.
      (-Math.abs(e.amount)).toFixed(2),
      e.taxDeductible ? "Yes" : "No",
    ].join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

/* ---- sample data (demo mode) ---------------------------------------------- */

export const sampleExpenses: Expense[] = [
  { id: "EX-1", incurredOn: "2026-07-30", category: "cleaning", vendor: "Lena Ortiz", description: "Orchard + Harvest silo turnovers", amount: 96, taxDeductible: true },
  { id: "EX-2", incurredOn: "2026-07-28", category: "supplies", vendor: "Restaurant Depot", description: "Restroom + kitchen restock", amount: 214.38, taxDeductible: true },
  { id: "EX-3", incurredOn: "2026-07-26", category: "cleaning", vendor: "Marco Reyes", description: "Coleman wedding full-venue clean", amount: 284.17, taxDeductible: true },
  { id: "EX-4", incurredOn: "2026-07-22", category: "maintenance", vendor: "Erie Septic Co.", description: "Annual septic pump & inspection", amount: 465, taxDeductible: true },
  { id: "EX-5", incurredOn: "2026-07-15", category: "utilities", vendor: "Firelands Electric", description: "Barn + silos — July", amount: 612.44, taxDeductible: true },
  { id: "EX-6", incurredOn: "2026-07-10", category: "marketing", vendor: "The Knot", description: "Featured listing — quarterly", amount: 899, taxDeductible: true },
  { id: "EX-7", incurredOn: "2026-07-05", category: "insurance", vendor: "Grange Mutual", description: "Event liability — monthly", amount: 388.5, taxDeductible: true },
  { id: "EX-8", incurredOn: "2026-06-29", category: "supplies", vendor: "Amazon Business", description: "Linens, towels, coffee for silos", amount: 341.02, taxDeductible: true },
];
