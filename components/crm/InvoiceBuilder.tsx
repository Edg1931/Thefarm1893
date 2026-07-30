"use client";

import { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Installment } from "@/lib/services/payments";

/** Generate a deposit + installment schedule for a booking (previews inline). */
export function InvoiceBuilder() {
  const [schedule, setSchedule] = useState<Installment[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function build(form: FormData) {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createSchedule",
          total: Number(form.get("total")) || 0,
          eventDate: String(form.get("eventDate") || ""),
          depositPct: Number(form.get("depositPct")) / 100 || 0.25,
          installments: Number(form.get("installments")) || 3,
        }),
      });
      const data = await res.json();
      setSchedule(data.schedule ?? []);
      setMsg(data.persisted ? "Schedule created and saved." : "Schedule generated (demo — connect the database to save & auto-bill).");
    } catch { setMsg("Could not build the schedule."); }
    finally { setBusy(false); }
  }

  return (
    <Panel title={<span className="flex items-center gap-2"><CalendarClock size={16} className="text-brass" /> Build a payment plan</span>}>
      <form action={build} className="grid gap-3 sm:grid-cols-4">
        <input name="total" type="number" placeholder="Total ($)" required className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
        <input name="eventDate" type="date" required className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
        <input name="depositPct" type="number" defaultValue={25} min={0} max={100} title="Deposit %" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
        <input name="installments" type="number" defaultValue={3} min={1} max={12} title="# installments" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
        <button type="submit" disabled={busy} className="btn btn-primary !py-2 !text-xs sm:col-span-3 disabled:opacity-60"><Plus size={14} /> {busy ? "Building…" : "Generate schedule"}</button>
      </form>

      {msg && <p className="mt-3 text-xs text-stone">{msg}</p>}
      {schedule && schedule.length > 0 && (
        <ul className="mt-4 space-y-2">
          {schedule.map((s, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl bg-bone p-3 text-sm">
              <span className="text-ink">{s.label}</span>
              <span className="flex items-center gap-3"><span className="text-xs text-stone">due {formatDate(s.dueDate)}</span><span className="font-medium text-ink">{formatCurrency(s.amount)}</span></span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
