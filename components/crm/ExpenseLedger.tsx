"use client";

import { useMemo, useState } from "react";
import { Plus, Download, Trash2, Receipt, PieChart } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { Toast } from "@/components/crm/Toast";
import { DemoBanner } from "@/components/crm/DemoBanner";
import { syncToApi, newId } from "@/lib/crm/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CATEGORY_LABEL, QB_ACCOUNT, categories, totalsByCategory, toQuickBooksCsv,
  type Expense, type ExpenseCategory,
} from "@/lib/crm/expenses";

/** Default range: the current calendar year — what an accountant asks for. */
function yearRange() {
  const y = new Date().getFullYear();
  return { from: `${y}-01-01`, to: `${y}-12-31` };
}

export function ExpenseLedger({ initial, live }: { initial: Expense[]; live: boolean }) {
  const [rows, setRows] = useState<Expense[]>(initial);
  const [range, setRange] = useState(yearRange);
  const [cat, setCat] = useState<ExpenseCategory | "all">("all");
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const filtered = useMemo(
    () => rows
      .filter((e) => e.incurredOn >= range.from && e.incurredOn <= range.to)
      .filter((e) => cat === "all" || e.category === cat)
      .sort((a, b) => b.incurredOn.localeCompare(a.incurredOn)),
    [rows, range, cat],
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const deductible = filtered.filter((e) => e.taxDeductible).reduce((s, e) => s + e.amount, 0);
  const byCat = useMemo(() => totalsByCategory(filtered), [filtered]);

  function add(form: FormData) {
    const e: Expense = {
      id: newId("EX"),
      incurredOn: String(form.get("incurredOn") || new Date().toISOString().slice(0, 10)),
      category: String(form.get("category") || "other") as ExpenseCategory,
      vendor: String(form.get("vendor") || ""),
      description: String(form.get("description") || ""),
      amount: Number(form.get("amount")) || 0,
      taxDeductible: form.get("taxDeductible") !== null,
    };
    setRows((all) => [e, ...all]);
    setAdding(false);
    syncToApi("/api/ops/expenses", "POST", e);
    say("Expense logged.");
  }

  function remove(id: string) {
    setRows((all) => all.filter((e) => e.id !== id));
    syncToApi("/api/ops/expenses", "POST", { action: "delete", id });
  }

  /**
   * Export the *filtered* rows. In demo mode the server has no data to export,
   * so the CSV is built client-side from exactly what's on screen — the file is
   * identical either way.
   */
  function exportCsv() {
    const blob = new Blob([toQuickBooksCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `farm1893-expenses-${range.from}-to-${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    say(`Exported ${filtered.length} expenses for QuickBooks.`);
  }

  return (
    <div className="space-y-6">
      <DemoBanner live={live} empty={live && rows.length === 0} what="expenses"
        emptyMessage="You're live — log an expense below and it'll be waiting in your QuickBooks export at tax time." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total in range" value={formatCurrency(total)} note={`${filtered.length} entries`} />
        <Stat label="Tax deductible" value={formatCurrency(deductible)} note={`${Math.round((deductible / (total || 1)) * 100)}% of spend`} />
        <Stat label="Largest category" value={byCat[0] ? CATEGORY_LABEL[byCat[0].category] : "—"} note={byCat[0] ? formatCurrency(byCat[0].total) : "Nothing logged yet"} />
      </div>

      {/* Filters + the two actions that matter */}
      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-parchment p-4 shadow-[var(--shadow-soft)]">
        <Field label="From"><input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} className={inputCls} /></Field>
        <Field label="To"><input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} className={inputCls} /></Field>
        <Field label="Category">
          <select value={cat} onChange={(e) => setCat(e.target.value as ExpenseCategory | "all")} className={inputCls}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
          </select>
        </Field>
        <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
          <button onClick={exportCsv} disabled={!filtered.length} className="btn btn-ghost !py-2 !text-xs disabled:opacity-50"><Download size={14} /> QuickBooks CSV</button>
          <button onClick={() => setAdding((v) => !v)} className="btn btn-primary !py-2 !text-xs"><Plus size={14} /> Log expense</button>
        </div>
      </div>

      {adding && (
        <Panel title="Log an expense">
          <form action={add} className="grid gap-3 sm:grid-cols-3">
            <input name="incurredOn" type="date" aria-label="Date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} />
            <select name="category" aria-label="Category" className={inputCls}>
              {categories.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
            </select>
            <input name="amount" type="number" step="0.01" placeholder="Amount" required aria-label="Amount" className={inputCls} />
            <input name="vendor" placeholder="Paid to" className={inputCls} />
            <input name="description" placeholder="What was it for?" className={`${inputCls} sm:col-span-2`} />
            <label className="flex items-center gap-2 text-sm text-ink-soft sm:col-span-2">
              <input name="taxDeductible" type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--color-sage-deep)]" />
              Tax deductible
            </label>
            <button type="submit" className="btn btn-primary !py-2 !text-xs">Save</button>
          </form>
        </Panel>
      )}

      {/* [&>*]:min-w-0 — grid children default to min-width:auto, so the wide
          table would push the whole page sideways on a phone instead of
          scrolling inside its own container. */}
      <div className="grid gap-6 xl:grid-cols-3 [&>*]:min-w-0">
        <Panel title={<span className="flex items-center gap-2"><Receipt size={16} className="text-brass" /> Ledger</span>} className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone">
                <tr className="border-b border-ink/8">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Details</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-sm text-stone">Nothing in this range yet.</td></tr>
                )}
                {filtered.map((e) => (
                  <tr key={e.id} className="group transition hover:bg-bone/60">
                    <td className="whitespace-nowrap py-3 text-ink-soft">{formatDate(e.incurredOn)}</td>
                    <td className="py-3"><span className="rounded-full bg-ink/6 px-2 py-0.5 text-xs text-ink-soft">{CATEGORY_LABEL[e.category]}</span></td>
                    <td className="py-3">
                      <p className="text-ink">{e.description || "—"}</p>
                      <p className="text-xs text-stone">{e.vendor || "—"}{e.taxDeductible ? "" : " · not deductible"}</p>
                    </td>
                    <td className="whitespace-nowrap py-3 text-right font-medium text-ink">{formatCurrency(e.amount)}</td>
                    <td className="py-3 pl-2 text-right">
                      <button onClick={() => remove(e.id)} aria-label={`Delete ${e.description || "expense"}`}
                        className="text-stone opacity-0 transition group-hover:opacity-100 hover:text-terracotta focus:opacity-100"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title={<span className="flex items-center gap-2"><PieChart size={16} className="text-brass" /> Where it goes</span>}>
          <div className="space-y-3">
            {byCat.length === 0 && <p className="text-sm text-stone">No spend in this range.</p>}
            {byCat.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{CATEGORY_LABEL[c.category]}</span>
                  <span className="font-medium text-ink">{formatCurrency(c.total)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-bone">
                  <div className="h-full rounded-full bg-brass" style={{ width: `${Math.round((c.total / (byCat[0]?.total || 1)) * 100)}%` }} />
                </div>
                <p className="mt-0.5 font-mono text-[0.62rem] text-stone">{QB_ACCOUNT[c.category]}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-ink/8 pt-4 text-xs text-stone">
            Categories map to QuickBooks accounts on export, so nothing has to be re-coded by hand at tax time.
          </p>
        </Panel>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

const inputCls = "rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wider text-stone">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-parchment p-5">
      <p className="text-xs uppercase tracking-wider text-stone">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-stone">{note}</p>
    </div>
  );
}
