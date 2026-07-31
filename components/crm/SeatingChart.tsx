"use client";

import { useState } from "react";
import { Plus, X, Users, UserPlus, Sparkles, Armchair } from "lucide-react";
import type { SeatingTable, Rsvp } from "@/lib/crm/portal";
import { getLocalSeating, setLocalSeating, syncToApi, newId } from "@/lib/crm/store";

/**
 * Couple-editable seating chart. Add tables, then assign guests (pulled from
 * their RSVP list). Optimistic + demo-persisted in the browser; live writes go
 * through /api/portal/seating.
 */
export function SeatingChart({ leadId, initial, rsvps, live = false }: { leadId: string; initial: SeatingTable[]; rsvps: Rsvp[]; live?: boolean }) {
  const [tables, setTables] = useState<SeatingTable[]>(() => (!live ? getLocalSeating(leadId) ?? initial : initial));
  const [picking, setPicking] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function persist(next: SeatingTable[]) {
    setTables(next);
    if (!live) setLocalSeating(leadId, next);
  }

  const assigned = new Set(tables.flatMap((t) => t.guests));
  const unassigned = rsvps.filter((r) => r.status !== "declined" && !assigned.has(r.guestName));

  function addTable() {
    const t: SeatingTable = { id: newId("TBL"), label: `Table ${tables.length}`, capacity: 8, guests: [] };
    persist([...tables, t]);
    syncToApi("/api/portal/seating", "POST", { action: "addTable", leadId, label: t.label, capacity: t.capacity });
  }
  function removeTable(id: string) {
    persist(tables.filter((t) => t.id !== id));
    syncToApi("/api/portal/seating", "POST", { action: "removeTable", leadId, tableId: id });
  }
  function assign(tableId: string, guestName: string) {
    persist(tables.map((t) => (t.id === tableId ? { ...t, guests: [...t.guests, guestName] } : t)));
    setPicking(null);
    syncToApi("/api/portal/seating", "POST", { action: "assign", leadId, tableId, guestName });
  }
  function unassign(tableId: string, guestName: string) {
    persist(tables.map((t) => (t.id === tableId ? { ...t, guests: t.guests.filter((g) => g !== guestName) } : t)));
  }

  /**
   * AI auto-arrange: seat the unassigned RSVP list into open seats, keeping the
   * same meal choice together (a simple, defensible grouping heuristic) and
   * respecting each table's capacity. Fills existing tables; flags overflow.
   */
  function autoArrange() {
    const byMeal = [...unassigned].sort((a, b) => (a.meal || "").localeCompare(b.meal || "") || a.guestName.localeCompare(b.guestName));
    const queue = byMeal.map((r) => r.guestName);
    const next = tables.map((t) => ({ ...t, guests: [...t.guests] }));
    const newAssignments: { tableId: string; guestName: string }[] = [];
    for (const t of next) {
      while (t.guests.length < t.capacity && queue.length) {
        const g = queue.shift()!;
        t.guests.push(g);
        newAssignments.push({ tableId: t.id, guestName: g });
      }
    }
    persist(next);
    newAssignments.forEach((a) => syncToApi("/api/portal/seating", "POST", { action: "assign", leadId, tableId: a.tableId, guestName: a.guestName }));
    if (queue.length) setNotice(`Seated ${newAssignments.length}. ${queue.length} guest${queue.length > 1 ? "s" : ""} still need a seat — add ${Math.ceil(queue.length / 8)} more table${Math.ceil(queue.length / 8) > 1 ? "s" : ""}.`);
    else setNotice(`✨ Everyone seated — grouped by meal choice. Drag anyone who'd rather move.`);
    setTimeout(() => setNotice(null), 6000);
  }

  const seated = tables.reduce((s, t) => s + t.guests.length, 0);

  if (tables.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-bone p-10 text-center">
        <Armchair className="mx-auto text-brass" size={28} />
        <p className="mt-3 font-display text-xl text-ink">Start your seating chart</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-stone">Add your first table, then seat guests from your RSVP list — or let AI arrange everyone by meal choice in one tap.</p>
        <button onClick={addTable} className="btn btn-primary mt-5 !py-2.5 !text-xs"><Plus size={14} /> Add your first table</button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone"><b className="text-ink">{seated}</b> seated · <b className="text-ink">{unassigned.length}</b> still to place</p>
        <div className="flex gap-2">
          <button onClick={autoArrange} disabled={unassigned.length === 0} className="btn btn-primary !py-2 !text-xs disabled:opacity-50"><Sparkles size={14} /> Auto-arrange</button>
          <button onClick={addTable} className="btn btn-ghost !py-2 !text-xs"><Plus size={14} /> Add table</button>
        </div>
      </div>

      {notice && <div className="mb-4 rounded-xl bg-brass/10 px-4 py-2.5 text-sm text-ink ring-1 ring-brass/25">{notice}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tables.map((t) => (
          <div key={t.id} className="rounded-2xl border border-ink/8 bg-bone p-4">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-medium text-ink"><Users size={15} className="text-brass" /> {t.label}</p>
              <button onClick={() => removeTable(t.id)} aria-label="Remove table" className="text-stone hover:text-terracotta"><X size={15} /></button>
            </div>
            <p className="mt-0.5 text-xs text-stone">{t.guests.length}/{t.capacity} seats</p>
            <ul className="mt-3 space-y-1.5">
              {t.guests.map((g) => (
                <li key={g} className="flex items-center justify-between rounded-lg bg-parchment px-3 py-1.5 text-sm text-ink">
                  {g}
                  <button onClick={() => unassign(t.id, g)} aria-label={`Remove ${g}`} className="text-stone hover:text-terracotta"><X size={13} /></button>
                </li>
              ))}
              {t.guests.length < t.capacity && (
                picking === t.id ? (
                  <li className="rounded-lg border border-dashed border-brass/40 bg-parchment p-2">
                    {unassigned.length === 0 ? (
                      <p className="px-1 text-xs text-stone">Everyone&apos;s seated 🎉</p>
                    ) : (
                      <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                        {unassigned.map((r) => (
                          <button key={r.id} onClick={() => assign(t.id, r.guestName)} className="rounded-full bg-brass/15 px-2.5 py-1 text-xs text-ink ring-1 ring-brass/30 hover:bg-brass/25">{r.guestName}</button>
                        ))}
                      </div>
                    )}
                  </li>
                ) : (
                  <li>
                    <button onClick={() => setPicking(t.id)} className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-ink/15 py-1.5 text-xs text-stone hover:border-brass hover:text-brass"><UserPlus size={13} /> Seat a guest</button>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
