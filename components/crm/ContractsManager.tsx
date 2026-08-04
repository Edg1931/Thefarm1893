"use client";

import { useState } from "react";
import { FileSignature, DollarSign, Clock, Plus, PenLine, Link2, Check, X } from "lucide-react";
import { Panel, StatCard } from "@/components/crm/widgets";
import { formatCurrency, formatDate } from "@/lib/utils";
import { newId } from "@/lib/crm/store";
import type { ContractRow } from "@/lib/crm/data";

const statusCls: Record<string, string> = {
  draft: "bg-ink/8 text-ink-soft",
  sent: "bg-brass/15 text-brass",
  signed: "bg-sage/15 text-sage-deep",
  paid: "bg-sage-deep text-parchment",
};

export function ContractsManager({ initial, live }: { initial: ContractRow[]; live: boolean }) {
  const [rows, setRows] = useState<ContractRow[]>(initial);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(null), 3500); }

  async function send(c: ContractRow) {
    setRows((r) => r.map((x) => (x.id === c.id ? { ...x, status: x.status === "draft" ? "sent" : x.status } : x)));
    try {
      const res = await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send", contractId: c.id }) });
      const data = await res.json();
      if (data.signUrl) {
        await navigator.clipboard?.writeText(location.origin + data.signUrl).catch(() => {});
        setCopied(c.id);
        setTimeout(() => setCopied(null), 3000);
        flash(`Signing link copied — ready to send to ${c.client}.`);
      }
    } catch { flash("Could not create the signing link."); }
  }

  async function create(form: FormData) {
    const client = String(form.get("client") || "New Client");
    const eventType = String(form.get("event") || "Wedding");
    const value = Number(form.get("value")) || 0;
    const deposit = Math.round(value * 0.25);
    const optimistic: ContractRow = { id: newId("C"), leadId: null, client, event: eventType, date: String(form.get("date") || ""), value, status: "draft", deposit, depositPaid: false, signedAt: null };
    setRows((r) => [optimistic, ...r]);
    setCreating(false);
    try {
      await fetch("/api/contracts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", clientName: client, eventType, eventDate: optimistic.date, value, deposit }) });
      flash(`Draft contract created for ${client}.`);
    } catch { flash("Saved locally — will sync when the database is connected."); }
  }

  const signedValue = rows.filter((c) => c.status === "signed" || c.status === "paid").reduce((s, c) => s + c.value, 0);
  const depositsCollected = rows.filter((c) => c.depositPaid).reduce((s, c) => s + c.deposit, 0);
  const awaiting = rows.filter((c) => c.status === "sent").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Contracts &amp; Deposits</h1>
          <p className="mt-1 text-stone">Draft, send a signing link, e-sign, and collect deposits — no paperwork, no chasing.</p>
        </div>
        <button onClick={() => setCreating((v) => !v)} className="btn btn-primary !py-2.5 !text-xs"><Plus size={15} /> New Contract</button>
      </div>

      {toast && <div className="rounded-xl bg-sage/12 px-4 py-2.5 text-sm text-sage-deep ring-1 ring-sage/25">{toast}</div>}

      {creating && (
        <Panel title="New contract">
          <form action={create} className="grid gap-3 sm:grid-cols-4">
            <input name="client" placeholder="Client name" required className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
            <input name="event" placeholder="Event type" defaultValue="Wedding" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="date" type="date" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="value" type="number" placeholder="Total value ($)" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
            <div className="flex gap-2 sm:col-span-2">
              <button type="submit" className="btn btn-primary !py-2 !text-xs">Create draft</button>
              <button type="button" onClick={() => setCreating(false)} className="btn btn-ghost !py-2 !text-xs"><X size={14} /> Cancel</button>
            </div>
          </form>
        </Panel>
      )}

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Signed contract value" value={formatCurrency(signedValue)} icon={FileSignature} accent="sage" />
        <StatCard label="Deposits collected" value={formatCurrency(depositsCollected)} icon={DollarSign} accent="brass" />
        <StatCard label="Awaiting signature" value={String(awaiting)} icon={Clock} accent="terracotta" />
      </div>

      <Panel title="All contracts" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
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
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-stone">No contracts yet — create one above and send a signing link in a click.</td></tr>
              )}
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-bone/60">
                  <td className="px-5 py-4"><p className="font-medium text-ink">{c.client}</p><p className="text-xs text-stone">{c.id}</p></td>
                  <td className="px-5 py-4"><p className="text-ink-soft">{c.event}</p><p className="text-xs text-stone">{c.date ? formatDate(c.date) : "—"}</p></td>
                  <td className="px-5 py-4 font-medium text-ink">{formatCurrency(c.value)}</td>
                  <td className="px-5 py-4"><p className="text-ink-soft">{formatCurrency(c.deposit)}</p><p className={`text-xs ${c.depositPaid ? "text-sage-deep" : "text-terracotta"}`}>{c.depositPaid ? "Paid" : "Unpaid"}</p></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusCls[c.status]}`}>{c.status}</span></td>
                  <td className="px-5 py-4">
                    {c.status === "draft" || c.status === "sent" ? (
                      <button onClick={() => send(c)} className="inline-flex items-center gap-1.5 text-sm font-medium text-brass hover:underline">
                        {copied === c.id ? <><Check size={14} /> Copied</> : <><Link2 size={14} /> {c.status === "draft" ? "Send" : "Resend"} link</>}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-sage-deep"><PenLine size={14} /> Signed{c.signedAt ? ` ${formatDate(c.signedAt)}` : ""}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <p className="text-center text-xs text-stone">{live ? "Live — signatures and deposits reconcile automatically." : "Demo — connect Stripe & Supabase and e-sign + deposits go live with no code change."}</p>
    </div>
  );
}
