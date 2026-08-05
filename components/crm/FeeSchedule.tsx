"use client";

import { useMemo, useState } from "react";
import { BadgeDollarSign, Plus, Ban, FileText, Clock } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { Toast } from "@/components/crm/Toast";
import { DemoBanner } from "@/components/crm/DemoBanner";
import { syncToApi, newId } from "@/lib/crm/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { chargeAmount, lateCheckoutCharge, uncapturedTotal, type FeeCharge, type FeeType } from "@/lib/crm/fees";

export function FeeSchedule({ feeTypes, charges, live }: { feeTypes: FeeType[]; charges: FeeCharge[]; live: boolean }) {
  const [fees, setFees] = useState<FeeType[]>(feeTypes);
  const [rows, setRows] = useState<FeeCharge[]>(charges);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  const uncaptured = useMemo(() => uncapturedTotal(rows), [rows]);
  const collected = rows.filter((c) => c.invoiced && !c.waived).reduce((s, c) => s + c.amount, 0);
  const label = (code: string) => fees.find((f) => f.code === code)?.label ?? code;

  function saveRate(fee: FeeType, amount: number, graceMinutes: number) {
    setFees((all) => all.map((f) => (f.code === fee.code ? { ...f, amount, graceMinutes } : f)));
    syncToApi("/api/ops/fees", "POST", { action: "rate", ...fee, amount, graceMinutes });
    say(`${fee.label} updated.`);
  }

  function addCharge(form: FormData) {
    const code = String(form.get("code") || fees[0]?.code);
    const fee = fees.find((f) => f.code === code);
    if (!fee) return;
    const minutesLate = form.get("minutesLate") ? Number(form.get("minutesLate")) : null;

    // Grace window is enforced here *and* server side — a 12-minute overrun
    // should never quietly turn into a $120 line on a couple's invoice.
    const resolved = minutesLate != null
      ? lateCheckoutCharge(minutesLate, fee)
      : { hours: Number(form.get("quantity")) || 1, amount: chargeAmount(fee, Number(form.get("quantity")) || 1) };

    if (resolved.amount <= 0) {
      say(`Inside the ${fee.graceMinutes}-minute grace window — nothing charged.`);
      setAdding(false);
      return;
    }
    const c: FeeCharge = {
      id: newId("FC"), feeCode: code,
      eventTitle: String(form.get("eventTitle") || "Event"),
      quantity: resolved.hours, amount: resolved.amount,
      reason: String(form.get("reason") || fee.label),
      waived: false, invoiced: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRows((all) => [c, ...all]);
    setAdding(false);
    syncToApi("/api/ops/fees", "POST", {
      action: "charge", code, quantity: resolved.hours, minutesLate, reason: c.reason,
    });
    say(`${formatCurrency(c.amount)} added to the event's balance.`);
  }

  function waive(c: FeeCharge) {
    setRows((all) => all.map((x) => (x.id === c.id ? { ...x, waived: true } : x)));
    syncToApi("/api/ops/fees", "POST", { action: "waive", id: c.id });
    say("Waived — it stays on the record as a courtesy.");
  }

  function invoiceAll() {
    const ids = rows.filter((c) => !c.waived && !c.invoiced).map((c) => c.id);
    if (!ids.length) return;
    setRows((all) => all.map((c) => (ids.includes(c.id) ? { ...c, invoiced: true } : c)));
    syncToApi("/api/ops/fees", "POST", { action: "invoice", ids });
    say(`${ids.length} charge${ids.length === 1 ? "" : "s"} added to invoices.`);
  }

  return (
    <div className="space-y-6">
      <DemoBanner live={live} empty={live && rows.length === 0} what="fee charges"
        emptyMessage="You're live — set your rates below and log a charge the moment it happens, while you still remember it." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Not yet invoiced" value={formatCurrency(uncaptured)} note="Owed but not on a bill" tone={uncaptured > 0 ? "warn" : "ok"} />
        <Stat label="Billed this season" value={formatCurrency(collected)} note={`${rows.filter((c) => c.invoiced).length} charges`} />
        <Stat label="Waived" value={formatCurrency(rows.filter((c) => c.waived).reduce((s, c) => s + c.amount, 0))} note="Courtesies given" />
      </div>

      {/* The rate card — editable, because the DB owns these numbers */}
      <Panel title={<span className="flex items-center gap-2"><BadgeDollarSign size={16} className="text-brass" /> Your rate card</span>}>
        <div className="grid gap-4 lg:grid-cols-3">
          {fees.map((f) => <RateCard key={f.code} fee={f} onSave={saveRate} />)}
        </div>
      </Panel>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone">Log a fee the day it happens — that's the difference between billing it and forgetting it.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={invoiceAll} disabled={uncaptured <= 0} className="btn btn-ghost !py-2 !text-xs disabled:opacity-50">
            <FileText size={14} /> Add all to invoices
          </button>
          <button onClick={() => setAdding((v) => !v)} className="btn btn-primary !py-2 !text-xs"><Plus size={14} /> Log a charge</button>
        </div>
      </div>

      {adding && (
        <Panel title="Log a billable fee">
          <form action={addCharge} className="grid gap-3 sm:grid-cols-3">
            <select name="code" aria-label="Fee type" className={inputCls}>
              {fees.filter((f) => f.active).map((f) => (
                <option key={f.code} value={f.code}>{f.label} — {formatCurrency(f.amount)}{f.unit === "hour" ? "/hr" : ""}</option>
              ))}
            </select>
            <input name="eventTitle" placeholder="Event or couple" className={inputCls} />
            <input name="quantity" type="number" step="0.5" defaultValue={1} aria-label="Quantity or hours" placeholder="Qty / hours" className={inputCls} />
            <input name="minutesLate" type="number" placeholder="Minutes late (late checkout only)" aria-label="Minutes late" className={`${inputCls} sm:col-span-2`} />
            <input name="reason" placeholder="Reason for the charge" className={inputCls} />
            <button type="submit" className="btn btn-primary !py-2 !text-xs sm:col-span-3">Add charge</button>
          </form>
          <p className="mt-3 text-xs text-stone">
            Enter minutes late for a checkout overrun and the grace window is applied automatically — inside it, nothing is billed.
          </p>
        </Panel>
      )}

      <Panel title="Charges">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-stone">
              <tr className="border-b border-ink/8">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Fee</th>
                <th className="pb-3 font-medium">Event</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 text-right font-medium">Amount</th>
                <th className="pb-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {rows.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-stone">No charges logged yet.</td></tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} className={`transition hover:bg-bone/60 ${c.waived ? "opacity-60" : ""}`}>
                  <td className="whitespace-nowrap py-3 text-ink-soft">{formatDate(c.createdAt)}</td>
                  <td className="py-3 text-ink">{label(c.feeCode)}</td>
                  <td className="py-3 text-ink-soft">{c.eventTitle}</td>
                  <td className="max-w-xs py-3 text-xs text-stone">{c.reason}</td>
                  <td className="whitespace-nowrap py-3 text-right font-medium text-ink">{formatCurrency(c.amount)}</td>
                  <td className="whitespace-nowrap py-3 text-right">
                    {c.waived ? (
                      <span className="rounded-full bg-ink/8 px-2 py-0.5 text-xs text-stone">Waived</span>
                    ) : c.invoiced ? (
                      <span className="rounded-full bg-sage/15 px-2 py-0.5 text-xs font-medium text-sage-deep">Invoiced</span>
                    ) : (
                      <button onClick={() => waive(c)} className="inline-flex items-center gap-1 rounded-full bg-brass/12 px-2 py-0.5 text-xs font-medium text-brass hover:bg-brass/20">
                        <Ban size={11} /> Waive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {toast && <Toast message={toast} />}
    </div>
  );
}

const inputCls = "rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass";

function RateCard({ fee, onSave }: { fee: FeeType; onSave: (f: FeeType, amount: number, grace: number) => void }) {
  const [amount, setAmount] = useState(String(fee.amount));
  const [grace, setGrace] = useState(String(fee.graceMinutes));
  const dirty = Number(amount) !== fee.amount || Number(grace) !== fee.graceMinutes;

  return (
    <div className="rounded-xl border border-ink/8 bg-bone p-4">
      <p className="font-medium text-ink">{fee.label}</p>
      <p className="mt-1 min-h-[3.5rem] text-xs text-stone">{fee.notes}</p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-[0.62rem] uppercase tracking-wider text-stone">Amount {fee.unit === "hour" ? "/hr" : ""}</span>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="1"
            className="w-24 rounded-lg border border-ink/12 bg-parchment px-2.5 py-2 text-sm outline-none focus:border-brass" />
        </label>
        {fee.unit === "hour" && (
          <label className="flex flex-col gap-1">
            <span className="flex items-center gap-1 text-[0.62rem] uppercase tracking-wider text-stone"><Clock size={10} /> Grace min</span>
            <input value={grace} onChange={(e) => setGrace(e.target.value)} type="number" step="1"
              className="w-20 rounded-lg border border-ink/12 bg-parchment px-2.5 py-2 text-sm outline-none focus:border-brass" />
          </label>
        )}
        {dirty && (
          <button onClick={() => onSave(fee, Number(amount) || 0, Number(grace) || 0)} className="btn btn-primary !py-2 !text-xs">Save</button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, note, tone = "ok" }: { label: string; value: string; note: string; tone?: "ok" | "warn" }) {
  return (
    <div className={`rounded-2xl border p-5 ${tone === "warn" ? "border-brass/30 bg-brass/6" : "border-ink/8 bg-parchment"}`}>
      <p className="text-xs uppercase tracking-wider text-stone">{label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-stone">{note}</p>
    </div>
  );
}
