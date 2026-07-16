"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Phone, Download, Plus, ChevronRight, X, Pencil, Check } from "lucide-react";
import { Panel, PriorityBadge, ScoreRing } from "@/components/crm/widgets";
import { leads as seed, type Lead } from "@/lib/crm/sample-data";
import { getAddedContacts, addContactLocal, getContactOverrides, setContactOverride, syncToApi, newId } from "@/lib/crm/store";
import { formatCurrency, formatDate } from "@/lib/utils";

const EVENT_TYPES = ["Wedding", "Corporate Retreat", "Anniversary", "Bridal Shower", "Celebration of Life", "Other"];
const STAGES = ["new", "toured", "proposal", "booked", "lost"];

export function ContactsManager() {
  const [contacts, setContacts] = useState<Lead[]>(seed);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Lead | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const added = getAddedContacts();
    const overrides = getContactOverrides();
    const merged = [...added, ...seed].map((l) => (overrides[l.id] ? { ...l, ...overrides[l.id] } : l));
    setContacts(merged);
    setAddedIds(new Set(added.map((a) => a.id)));
  }, []);

  function saveEdit(updated: Lead) {
    const { id, ...patch } = updated;
    setContactOverride(id, patch);
    syncToApi("/api/contacts", "PATCH", updated);
    setContacts((list) => list.map((c) => (c.id === id ? updated : c)));
    setEditing(null);
    flash("Contact updated.");
  }
  function addContact(c: Lead) {
    addContactLocal(c);
    syncToApi("/api/contacts", "POST", c);
    setContacts((list) => [c, ...list]);
    setAddedIds((s) => new Set(s).add(c.id));
    setAdding(false);
    flash("Contact added.");
  }
  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2400); }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Contacts</h1>
          <p className="mt-1 text-stone">Click a client to open their dossier, or edit details inline.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost !py-2.5 !text-xs"><Download size={15} /> Export</button>
          <button onClick={() => setAdding(true)} className="btn btn-primary !py-2.5 !text-xs"><Plus size={15} /> New Contact</button>
        </div>
      </div>

      <Panel className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-bone text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-5 py-3.5 font-medium">Contact</th>
                <th className="px-5 py-3.5 font-medium">Event</th>
                <th className="px-5 py-3.5 font-medium">Value</th>
                <th className="px-5 py-3.5 font-medium">Score</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {contacts.map((l) => {
                const isNew = addedIds.has(l.id);
                return (
                  <tr key={l.id} className="group transition hover:bg-bone/60">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-sage-deep/90 font-display text-sm text-parchment">
                          {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-ink">{l.name}</p>
                          <p className="text-xs text-stone">{l.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><p className="text-ink-soft">{l.eventType}</p><p className="text-xs text-stone">{l.eventDate ? formatDate(l.eventDate) : "—"} · {l.guestCount} guests</p></td>
                    <td className="px-5 py-4 font-medium text-ink">{formatCurrency(l.budget)}</td>
                    <td className="px-5 py-4"><ScoreRing score={l.score} /></td>
                    <td className="px-5 py-4"><PriorityBadge priority={l.stage === "booked" ? "booked" : l.priority} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(l)} className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen" aria-label="Edit"><Pencil size={14} /></button>
                        <a href={`mailto:${l.email}`} className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen" aria-label="Email"><Mail size={14} /></a>
                        {isNew ? (
                          <span className="text-xs text-stone">New</span>
                        ) : (
                          <Link href={`/dashboard/clients/${l.id}`} className="flex items-center gap-0.5 text-sm font-medium text-brass hover:underline">Open <ChevronRight size={14} /></Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {editing && <ContactModal contact={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
      {adding && <ContactModal onClose={() => setAdding(false)} onSave={addContact} isNew />}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl bg-sage-deep px-5 py-3 text-sm text-parchment shadow-lg"><Check size={16} /> {toast}</div>
      )}
    </div>
  );
}

function ContactModal({ contact, onClose, onSave, isNew }: { contact?: Lead; onClose: () => void; onSave: (l: Lead) => void; isNew?: boolean }) {
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const base: Lead = contact ?? {
      id: newId("L"), name: "", email: "", phone: "", eventType: "Wedding", eventDate: "",
      guestCount: 0, budget: 0, stage: "new", score: 50, priority: "warm", source: "CRM", lastActivity: "just now", aiSummary: "",
    };
    const updated: Lead = {
      ...base,
      name: String(fd.get("name") || base.name),
      email: String(fd.get("email") || base.email),
      phone: String(fd.get("phone") || base.phone),
      eventType: String(fd.get("eventType") || base.eventType),
      eventDate: String(fd.get("eventDate") || base.eventDate),
      guestCount: Number(fd.get("guestCount")) || base.guestCount,
      budget: Number(fd.get("budget")) || base.budget,
      stage: String(fd.get("stage") || base.stage) as Lead["stage"],
      aiSummary: String(fd.get("aiSummary") || base.aiSummary),
    };
    onSave(updated);
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-parchment p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">{isNew ? "New contact" : `Edit ${contact?.name}`}</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <F name="name" label="Name*" def={contact?.name} required />
            <F name="email" label="Email" type="email" def={contact?.email} />
            <F name="phone" label="Phone" def={contact?.phone} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-stone">Event type</label>
              <select name="eventType" defaultValue={contact?.eventType ?? "Wedding"} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage">
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <F name="eventDate" label="Event date" type="date" def={contact?.eventDate} />
            <F name="guestCount" label="Guests" type="number" def={contact?.guestCount ? String(contact.guestCount) : ""} />
            <F name="budget" label="Est. value ($)" type="number" def={contact?.budget ? String(contact.budget) : ""} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-stone">Stage</label>
              <select name="stage" defaultValue={contact?.stage ?? "new"} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 capitalize outline-none focus:border-sage">
                {STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-stone">Notes</label>
            <textarea name="aiSummary" rows={3} defaultValue={contact?.aiSummary} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 !py-2.5">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1 !py-2.5"><Check size={15} /> {isNew ? "Add Contact" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function F({ name, label, type = "text", def, required }: { name: string; label: string; type?: string; def?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-stone">{label}</label>
      <input name={name} type={type} defaultValue={def} required={required} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage" />
    </div>
  );
}
