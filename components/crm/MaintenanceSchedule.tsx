"use client";

import { useState } from "react";
import { Wrench, CheckCircle2, Plus, Wind, Droplets, Trees, Cog } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { formatDate } from "@/lib/utils";
import { syncToApi, newId } from "@/lib/crm/store";
import { maintenanceDueSoon, type MaintenanceAsset } from "@/lib/crm/operations";

const kindIcon: Record<string, typeof Wrench> = { hvac: Wind, pool: Droplets, septic: Cog, grounds: Trees, other: Wrench };

export function MaintenanceSchedule({ initial, live }: { initial: MaintenanceAsset[]; live: boolean }) {
  const [assets, setAssets] = useState<MaintenanceAsset[]>(initial);
  const [adding, setAdding] = useState(false);

  function logService(a: MaintenanceAsset) {
    const now = new Date();
    const nextD = new Date(now); nextD.setDate(nextD.getDate() + a.intervalDays);
    const nextService = nextD.toISOString().slice(0, 10);
    setAssets((all) => all.map((x) => (x.id === a.id ? { ...x, lastService: now.toISOString().slice(0, 10), nextService } : x)));
    syncToApi("/api/ops/maintenance", "POST", { action: "log", id: a.id, intervalDays: a.intervalDays });
  }
  function add(form: FormData) {
    const interval = Number(form.get("intervalDays")) || 90;
    const nextD = new Date(); nextD.setDate(nextD.getDate() + interval);
    const a: MaintenanceAsset = {
      id: newId("M"), name: String(form.get("name") || "Asset"), kind: (String(form.get("kind") || "other") as MaintenanceAsset["kind"]),
      lastService: new Date().toISOString().slice(0, 10), nextService: nextD.toISOString().slice(0, 10), intervalDays: interval,
    };
    setAssets((all) => [...all, a]);
    setAdding(false);
    syncToApi("/api/ops/maintenance", "POST", { action: "create", name: a.name, kind: a.kind, lastService: a.lastService, nextService: a.nextService, intervalDays: interval });
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end"><button onClick={() => setAdding((v) => !v)} className="btn btn-ghost !py-2 !text-xs"><Plus size={14} /> Add asset</button></div>

      {adding && (
        <Panel title="New maintenance asset">
          <form action={add} className="grid gap-3 sm:grid-cols-4">
            <input name="name" placeholder="Asset name" required className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
            <select name="kind" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass">
              {["hvac", "pool", "septic", "grounds", "other"].map((k) => <option key={k}>{k}</option>)}
            </select>
            <input name="intervalDays" type="number" placeholder="Every N days" defaultValue={90} className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <button type="submit" className="btn btn-primary !py-2 !text-xs sm:col-span-2">Add</button>
          </form>
        </Panel>
      )}

      {assets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-ink/15 bg-bone p-10 text-center">
          <p className="font-display text-xl text-ink">No assets tracked yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-stone">Add your HVAC, pool, septic, and grounds equipment to get ahead of every service date.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {assets.map((a) => {
          const Icon = kindIcon[a.kind] ?? Wrench;
          const due = maintenanceDueSoon(a);
          const overdue = new Date(a.nextService + "T00:00:00").getTime() < Date.now();
          return (
            <div key={a.id} className={`rounded-2xl border p-5 ${overdue ? "border-terracotta/30 bg-terracotta/5" : due ? "border-brass/30 bg-brass/5" : "border-ink/8 bg-parchment"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="flex items-center gap-2 font-display text-lg text-ink"><Icon size={17} className="text-brass" /> {a.name}</p>
                  <p className="mt-1 text-xs capitalize text-stone">{a.kind} · every {a.intervalDays} days</p>
                </div>
                {overdue ? <span className="rounded-full bg-terracotta/15 px-2 py-0.5 text-[0.6rem] font-medium text-terracotta">OVERDUE</span> : due ? <span className="rounded-full bg-brass/15 px-2 py-0.5 text-[0.6rem] font-medium text-brass">DUE SOON</span> : null}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3 text-xs text-stone">
                <span>Last {a.lastService ? formatDate(a.lastService) : "—"} · Next {a.nextService ? formatDate(a.nextService) : "—"}</span>
                <button onClick={() => logService(a)} className="inline-flex items-center gap-1 font-medium text-brass hover:underline"><CheckCircle2 size={13} /> Log service</button>
              </div>
            </div>
          );
        })}
      </div>
      {!live && <p className="text-center text-xs text-stone">Demo — service logs roll the next due date forward and sync once Supabase is connected.</p>}
    </div>
  );
}
