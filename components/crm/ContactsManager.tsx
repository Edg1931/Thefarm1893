"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Download, Plus, ChevronRight, Pencil, Check } from "lucide-react";
import { Panel, PriorityBadge, ScoreRing } from "@/components/crm/widgets";
import { ContactModal } from "@/components/crm/ContactModal";
import { leads as seed, type Lead } from "@/lib/crm/sample-data";
import { getAddedContacts, addContactLocal, getContactOverrides, setContactOverride, syncToApi } from "@/lib/crm/store";
import { formatCurrency, formatDate } from "@/lib/utils";

export function ContactsManager({ initial = seed, live = false }: { initial?: Lead[]; live?: boolean }) {
  const [contacts, setContacts] = useState<Lead[]>(initial);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Lead | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (live) { setContacts(initial); return; } // DB is the source of truth
    const added = getAddedContacts();
    const overrides = getContactOverrides();
    const merged = [...added, ...initial].map((l) => (overrides[l.id] ? { ...l, ...overrides[l.id] } : l));
    setContacts(merged);
    setAddedIds(new Set(added.map((a) => a.id)));
  }, [initial, live]);

  function saveEdit(updated: Lead) {
    const { id, ...patch } = updated;
    if (!live) setContactOverride(id, patch);
    syncToApi("/api/contacts", "PATCH", updated);
    setContacts((list) => list.map((c) => (c.id === id ? updated : c)));
    setEditing(null);
    flash("Contact updated.");
  }
  function addContact(c: Lead) {
    if (!live) addContactLocal(c);
    syncToApi("/api/contacts", "POST", c);
    setContacts((list) => [c, ...list]);
    setAddedIds((s) => new Set(s).add(c.id));
    setAdding(false);
    flash("Contact added.");
  }
  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2400); }

  function exportCsv() {
    const cols: (keyof Lead)[] = ["name", "email", "phone", "eventType", "eventDate", "guestCount", "budget", "stage", "source"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = [cols.join(","), ...contacts.map((c) => cols.map((k) => esc(c[k])).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "farm1893-contacts.csv";
    a.click();
    URL.revokeObjectURL(url);
    flash("Contacts exported to CSV.");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Contacts</h1>
          <p className="mt-1 text-stone">Click a client to open their dossier, or edit details inline.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="btn btn-ghost !py-2.5 !text-xs"><Download size={15} /> Export</button>
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
