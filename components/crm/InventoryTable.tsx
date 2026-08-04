"use client";

import { useState } from "react";
import { Plus, Minus, AlertTriangle, PackagePlus } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { syncToApi, newId } from "@/lib/crm/store";
import type { InventoryItem } from "@/lib/crm/operations";

export function InventoryTable({ initial, live }: { initial: InventoryItem[]; live: boolean }) {
  const [items, setItems] = useState<InventoryItem[]>(initial);
  const [adding, setAdding] = useState(false);

  function adjust(id: string, delta: number) {
    setItems((all) => all.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)));
    const item = items.find((i) => i.id === id);
    if (item) syncToApi("/api/ops/inventory", "POST", { action: "adjust", id, quantity: Math.max(0, item.quantity + delta) });
  }
  function add(form: FormData) {
    const i: InventoryItem = {
      id: newId("I"), name: String(form.get("name") || "Item"), category: String(form.get("category") || "Other"),
      quantity: Number(form.get("quantity")) || 0, parLevel: Number(form.get("parLevel")) || 0, unit: String(form.get("unit") || "units"),
    };
    setItems((all) => [...all, i]);
    setAdding(false);
    syncToApi("/api/ops/inventory", "POST", { action: "create", name: i.name, category: i.category, quantity: i.quantity, parLevel: i.parLevel, unit: i.unit });
  }

  const low = items.filter((i) => i.quantity < i.parLevel);

  return (
    <div className="space-y-5">
      {low.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-ink ring-1 ring-terracotta/25">
          <AlertTriangle size={16} className="text-terracotta" /> {low.length} item{low.length > 1 ? "s" : ""} below par: {low.map((i) => i.name).join(", ")}.
        </div>
      )}
      <div className="flex justify-end"><button onClick={() => setAdding((v) => !v)} className="btn btn-ghost !py-2 !text-xs"><PackagePlus size={14} /> Add item</button></div>

      {adding && (
        <Panel title="New inventory item">
          <form action={add} className="grid gap-3 sm:grid-cols-5">
            <input name="name" placeholder="Item name" required className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
            <input name="category" placeholder="Category" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="quantity" type="number" placeholder="Qty" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="parLevel" type="number" placeholder="Par" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="unit" placeholder="Unit" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
            <button type="submit" className="btn btn-primary !py-2 !text-xs sm:col-span-3">Add</button>
          </form>
        </Panel>
      )}

      <Panel title="Inventory" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-bone text-xs uppercase tracking-wider text-stone">
              <tr><th className="px-5 py-3.5 font-medium">Item</th><th className="px-5 py-3.5 font-medium">Category</th><th className="px-5 py-3.5 font-medium">On hand</th><th className="px-5 py-3.5 font-medium">Par</th><th className="px-5 py-3.5 font-medium">Adjust</th></tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-stone">Nothing tracked yet — add tables, chairs, and linens to get low-stock alerts.</td></tr>
              )}
              {items.map((i) => {
                const lo = i.quantity < i.parLevel;
                return (
                  <tr key={i.id} className={lo ? "bg-terracotta/5" : "hover:bg-bone/60"}>
                    <td className="px-5 py-3.5"><span className="font-medium text-ink">{i.name}</span>{lo && <span className="ml-2 rounded-full bg-terracotta/15 px-2 py-0.5 text-[0.6rem] font-medium text-terracotta">LOW</span>}</td>
                    <td className="px-5 py-3.5 text-ink-soft">{i.category}</td>
                    <td className="px-5 py-3.5 font-medium text-ink">{i.quantity} <span className="text-xs font-normal text-stone">{i.unit}</span></td>
                    <td className="px-5 py-3.5 text-stone">{i.parLevel}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => adjust(i.id, -1)} aria-label="Decrease" className="grid h-7 w-7 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><Minus size={13} /></button>
                        <button onClick={() => adjust(i.id, 1)} aria-label="Increase" className="grid h-7 w-7 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><Plus size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      {!live && <p className="text-center text-xs text-stone">Demo — quantities sync to Supabase once connected. Low-stock alerts surface on your dashboard.</p>}
    </div>
  );
}
