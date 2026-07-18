"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check, Clock, CircleAlert, Pencil, X, Plus, DollarSign, CreditCard, Info,
} from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { type VendorAssignment, type Payment, type ChecklistItem } from "@/lib/crm/bookings";
import { getDossierOverride, setDossierOverride, syncToApi } from "@/lib/crm/store";
import { formatCurrency, formatDate } from "@/lib/utils";

const vendorStatus: Record<string, { cls: string; label: string; Icon: typeof Check }> = {
  confirmed: { cls: "text-sage-deep bg-sage/12", label: "Confirmed", Icon: Check },
  pending: { cls: "text-brass bg-brass/12", label: "Pending", Icon: Clock },
  needed: { cls: "text-terracotta bg-terracotta/10", label: "Needed", Icon: CircleAlert },
};

type Props = {
  leadId: string;
  contractValue: number;
  vendors: VendorAssignment[];
  payments: Payment[];
  checklist: ChecklistItem[];
  vendorOptions: { name: string; category: string }[];
};

export function DossierHub({ leadId, contractValue, vendors: v0, payments: p0, checklist: c0, vendorOptions }: Props) {
  const [vendors, setVendors] = useState(v0);
  const [payments, setPayments] = useState(p0);
  const [checklist, setChecklist] = useState(c0);
  const [editRole, setEditRole] = useState<string | null>(null);
  const [addingPayment, setAddingPayment] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const o = getDossierOverride(leadId);
    if (o?.vendors) setVendors(o.vendors);
    if (o?.payments) setPayments(o.payments);
    if (o?.checklist) setChecklist(o.checklist);
  }, [leadId]);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 2200); }
  function persist(patch: { vendors?: VendorAssignment[]; payments?: Payment[]; checklist?: ChecklistItem[] }) {
    setDossierOverride(leadId, patch);
    syncToApi("/api/dossier", "PATCH", { leadId, ...patch });
  }

  function saveVendor(role: string, next: Partial<VendorAssignment>) {
    const updated = vendors.map((v) => (v.role === role ? { ...v, ...next } : v));
    setVendors(updated);
    persist({ vendors: updated });
    setEditRole(null);
    flash("Vendor assignment saved.");
  }

  function togglePaid(label: string) {
    const updated = payments.map((p) => (p.label === label ? { ...p, paid: !p.paid } : p));
    setPayments(updated);
    persist({ payments: updated });
    flash("Payment updated.");
  }
  function addPayment(p: Payment) {
    const updated = [...payments, p];
    setPayments(updated);
    persist({ payments: updated });
    setAddingPayment(false);
    flash("Payment logged.");
  }

  function toggleCheck(label: string) {
    const updated = checklist.map((c) => (c.label === label ? { ...c, done: !c.done } : c));
    setChecklist(updated);
    persist({ checklist: updated });
  }

  const paid = useMemo(() => payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0), [payments]);
  const balance = contractValue - paid;
  const done = checklist.filter((c) => c.done).length;
  const pct = checklist.length ? Math.round((done / checklist.length) * 100) : 0;
  const filled = vendors.filter((v) => v.name).length;

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {/* Vendor team (editable) */}
      <Panel title="Vendor team" className="xl:col-span-2"
        action={<span className="text-xs text-stone">{filled}/{vendors.length} filled</span>}>
        <div className="grid gap-3 sm:grid-cols-2">
          {vendors.map((v) => {
            const s = vendorStatus[v.status];
            const isEditing = editRole === v.role;
            return (
              <div key={v.role} className="rounded-xl bg-bone p-4">
                {isEditing ? (
                  <VendorEditor v={v} options={vendorOptions} onCancel={() => setEditRole(null)} onSave={(n) => saveVendor(v.role, n)} />
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-stone">{v.role}</p>
                      {v.name ? (
                        <>
                          <p className="truncate font-medium text-ink">{v.name}</p>
                          {v.contact && <p className="truncate text-xs text-stone">{v.contact}</p>}
                        </>
                      ) : (
                        <p className="text-sm italic text-terracotta">Not booked yet</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${s.cls}`}>
                        <s.Icon size={12} /> {s.label}
                      </span>
                      <button onClick={() => setEditRole(v.role)} className="grid h-7 w-7 place-items-center rounded-lg bg-parchment text-ink-soft hover:bg-linen" aria-label={`Edit ${v.role}`}>
                        <Pencil size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Link href="/dashboard/vendors" className="mt-4 inline-block text-sm text-brass hover:underline">Manage vendor network →</Link>
      </Panel>

      <div className="space-y-6">
        {/* Payments (editable) */}
        <Panel title="Payments" action={
          <button onClick={() => setAddingPayment(true)} className="flex items-center gap-1 text-sm text-brass hover:underline"><Plus size={14} /> Log</button>
        }>
          <div className="space-y-2.5">
            {payments.map((p) => (
              <div key={p.label} className="flex items-center justify-between rounded-lg bg-bone px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{p.label}</p>
                  <p className="text-xs text-stone">Due {p.due ? formatDate(p.due) : "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-ink">{formatCurrency(p.amount)}</span>
                  <button
                    onClick={() => togglePaid(p.label)}
                    className={`rounded-full px-2.5 py-1 text-[0.68rem] font-medium transition ${
                      p.paid ? "bg-sage-deep text-parchment hover:opacity-90" : "border border-terracotta/40 text-terracotta hover:bg-terracotta/10"
                    }`}
                  >
                    {p.paid ? "Paid ✓" : "Mark paid"}
                  </button>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="rounded-lg bg-bone px-4 py-6 text-center text-sm text-stone">No payments yet.</p>}
          </div>
          <div className="mt-4 border-t border-ink/8 pt-4 text-sm">
            <div className="flex justify-between text-stone"><span>Paid to date</span><span className="font-medium text-sage-deep">{formatCurrency(paid)}</span></div>
            <div className="flex justify-between text-stone"><span>Balance</span><span className="font-medium text-ink">{formatCurrency(balance)}</span></div>
          </div>
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-brass/8 p-2.5 text-[0.7rem] leading-relaxed text-ink-soft">
            <Info size={13} className="mt-0.5 shrink-0 text-brass" />
            Deposits and registry gifts log here automatically once Stripe/Helcim is connected. Until then, mark them as you receive them.
          </p>
        </Panel>

        {/* Planning progress (editable) */}
        <Panel title="Planning progress" action={<span className="text-sm font-medium text-ink">{pct}%</span>}>
          <div className="h-2 overflow-hidden rounded-full bg-linen">
            <div className="h-full rounded-full bg-gradient-to-r from-sage-deep to-sage transition-all" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-4 space-y-1">
            {checklist.map((c) => (
              <li key={c.label}>
                <button onClick={() => toggleCheck(c.label)} className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left text-sm transition hover:bg-bone">
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${c.done ? "bg-sage text-parchment" : "border border-ink/20"}`}>
                    {c.done && <Check size={12} />}
                  </span>
                  <span className={c.done ? "text-stone line-through" : "text-ink-soft"}>{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {addingPayment && <PaymentModal onClose={() => setAddingPayment(false)} onSave={addPayment} />}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl bg-sage-deep px-5 py-3 text-sm text-parchment shadow-lg"><Check size={16} /> {toast}</div>
      )}
    </div>
  );
}

function VendorEditor({ v, options, onCancel, onSave }: {
  v: VendorAssignment; options: { name: string; category: string }[];
  onCancel: () => void; onSave: (n: Partial<VendorAssignment>) => void;
}) {
  const [name, setName] = useState(v.name ?? "");
  const [contact, setContact] = useState(v.contact ?? "");
  const [status, setStatus] = useState<VendorAssignment["status"]>(v.status);
  const listId = `vendors-${v.role.replace(/\W/g, "")}`;

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-stone">{v.role}</p>
      <input list={listId} value={name} onChange={(e) => setName(e.target.value)} placeholder="Vendor name"
        className="w-full rounded-lg border border-ink/15 bg-parchment px-3 py-2 text-sm outline-none focus:border-sage" />
      <datalist id={listId}>
        {options.map((o) => <option key={o.name} value={o.name}>{o.category}</option>)}
      </datalist>
      <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Email / phone (optional)"
        className="mt-2 w-full rounded-lg border border-ink/15 bg-parchment px-3 py-2 text-sm outline-none focus:border-sage" />
      <div className="mt-2 flex items-center gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value as VendorAssignment["status"])}
          className="flex-1 rounded-lg border border-ink/15 bg-parchment px-3 py-2 text-sm capitalize outline-none focus:border-sage">
          <option value="needed">Needed</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
        </select>
        <button onClick={() => onSave({ name: name.trim() || null, contact: contact.trim() || undefined, status })}
          className="grid h-9 w-9 place-items-center rounded-lg bg-sage-deep text-parchment hover:opacity-90" aria-label="Save"><Check size={15} /></button>
        <button onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-lg bg-parchment text-stone hover:bg-linen" aria-label="Cancel"><X size={15} /></button>
      </div>
    </div>
  );
}

function PaymentModal({ onClose, onSave }: { onClose: () => void; onSave: (p: Payment) => void }) {
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      label: String(fd.get("label") || "Payment"),
      amount: Number(fd.get("amount")) || 0,
      due: String(fd.get("due") || ""),
      paid: fd.get("paid") === "on",
    });
  }
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-parchment p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><CreditCard size={20} className="text-brass" /> Log a payment</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-stone">Description</label>
            <input name="label" required placeholder="e.g. Second installment" className="rounded-xl border border-ink/15 bg-bone px-4 py-3 text-sm outline-none focus:border-sage" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-stone">Amount ($)</label>
              <div className="flex items-center rounded-xl border border-ink/15 bg-bone px-3">
                <DollarSign size={15} className="text-stone" />
                <input name="amount" type="number" min="0" required className="w-full bg-transparent px-1 py-3 text-sm outline-none" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-stone">Due date</label>
              <input name="due" type="date" className="rounded-xl border border-ink/15 bg-bone px-4 py-3 text-sm outline-none focus:border-sage" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input name="paid" type="checkbox" className="h-4 w-4 rounded border-ink/30 accent-sage-deep" /> Already received (mark as paid)
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 !py-2.5">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1 !py-2.5"><Check size={15} /> Log Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
