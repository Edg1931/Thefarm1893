"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Check, Plus } from "lucide-react";
import { PriorityBadge, ScoreRing } from "./widgets";
import { ContactModal } from "./ContactModal";
import { type Lead, type Stage } from "@/lib/crm/sample-data";
import {
  getAddedContacts, addContactLocal, getContactOverrides, setContactOverride, syncToApi,
} from "@/lib/crm/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Toast } from "@/components/crm/Toast";

const COLUMNS: { key: Stage; label: string; hint: string }[] = [
  { key: "new", label: "New Inquiry", hint: "Respond fast" },
  { key: "toured", label: "Toured", hint: "Nurture" },
  { key: "proposal", label: "Proposal Sent", hint: "Close" },
  { key: "booked", label: "Booked 🎉", hint: "Deliver" },
  { key: "lost", label: "Lost / Nurture", hint: "Re-engage" },
];

export function PipelineBoard({ initial, live = false }: { initial: Lead[]; live?: boolean }) {
  const [items, setItems] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState("");
  const didDrag = useRef(false);

  // Demo mode: merge browser-stored additions + edits. Live mode: the DB rows
  // passed as `initial` are the source of truth — no localStorage merge.
  useEffect(() => {
    if (live) { setItems(initial); return; }
    const added = getAddedContacts();
    const overrides = getContactOverrides();
    const merged = [...added, ...initial].map((l) => (overrides[l.id] ? { ...l, ...overrides[l.id] } : l));
    setItems(merged);
  }, [initial, live]);

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 2200); }

  function move(id: string, stage: Stage) {
    setDragId(null);
    const current = items.find((l) => l.id === id);
    if (!current || current.stage === stage) return;
    const patch: Partial<Lead> = { stage, lastActivity: "just now" };
    setItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    if (!live) setContactOverride(id, patch);
    syncToApi("/api/contacts", "PATCH", { id, ...patch });
    flash(`${current.name} → ${COLUMNS.find((c) => c.key === stage)?.label ?? stage}`);
  }

  function saveEdit(updated: Lead) {
    const { id, ...patch } = updated;
    if (!live) setContactOverride(id, patch);
    syncToApi("/api/contacts", "PATCH", updated);
    setItems((list) => list.map((c) => (c.id === id ? updated : c)));
    setEditing(null);
    flash("Lead updated.");
  }

  function addLead(c: Lead) {
    if (!live) addContactLocal(c);
    syncToApi("/api/contacts", "POST", c);
    setItems((list) => [c, ...list]);
    setAdding(false);
    flash("Lead added.");
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => setAdding(true)} className="btn btn-primary !py-2.5 !text-xs"><Plus size={15} /> Add lead</button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colItems = items.filter((l) => l.stage === col.key);
          const value = colItems.reduce((s, l) => s + l.budget, 0);
          return (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragId && move(dragId, col.key)}
              className="flex w-[280px] shrink-0 flex-col rounded-2xl bg-linen/60 p-3"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <p className="text-sm font-semibold text-ink">{col.label}</p>
                  <p className="text-[0.7rem] text-stone">{colItems.length} · {formatCurrency(value)}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[0.65rem] text-stone">{col.hint}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5">
                {colItems.map((l) => (
                  <article
                    key={l.id}
                    draggable
                    onDragStart={() => { didDrag.current = true; setDragId(l.id); }}
                    onDragEnd={() => { setTimeout(() => (didDrag.current = false), 50); }}
                    onClick={() => { if (!didDrag.current) setEditing(l); }}
                    title="Click to edit · drag to change stage"
                    className={`cursor-pointer rounded-xl bg-parchment p-3.5 shadow-sm ring-1 ring-ink/5 transition active:cursor-grabbing ${
                      dragId === l.id ? "opacity-50" : "hover:shadow-md hover:ring-brass/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{l.name}</p>
                        <p className="text-xs text-stone">{l.eventType} · {l.eventDate ? formatDate(l.eventDate) : "—"}</p>
                      </div>
                      <ScoreRing score={l.score} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-[0.72rem] leading-relaxed text-ink-soft">{l.aiSummary}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <PriorityBadge priority={l.stage === "booked" ? "booked" : l.priority} />
                      <span className="text-xs font-medium text-ink">{formatCurrency(l.budget)}</span>
                    </div>
                  </article>
                ))}
                {colItems.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-ink/15 py-8 text-xs text-stone">
                    <GripVertical size={14} className="mr-1" /> Drop here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editing && <ContactModal contact={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
      {adding && <ContactModal isNew onClose={() => setAdding(false)} onSave={addLead} />}

      {toast && (
        <Toast message={toast} />
      )}
    </>
  );
}
