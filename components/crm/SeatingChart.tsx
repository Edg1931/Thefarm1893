"use client";

import { useState } from "react";
import { Plus, X, Users, UserPlus } from "lucide-react";
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

  const seated = tables.reduce((s, t) => s + t.guests.length, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone"><b className="text-ink">{seated}</b> seated · <b className="text-ink">{unassigned.length}</b> still to place</p>
        <button onClick={addTable} className="btn btn-ghost !py-2 !text-xs"><Plus size={14} /> Add table</button>
      </div>

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
                      <p className="px-1 text-xs text-stone">Everyone's seated 🎉</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {unassigned.slice(0, 8).map((r) => (
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
