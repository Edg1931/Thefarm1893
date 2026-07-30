"use client";

import { useState } from "react";
import { Zap, Plus } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { newId } from "@/lib/crm/store";
import { describeAction } from "@/lib/services/automations";
import type { Automation } from "@/lib/crm/comms";

const triggerOptions = ["lead.created", "tour.completed+3d", "stay.checkout+3d", "invoice.due-14d", "rsvp.future-couple", "anniversary"];
const actionOptions = ["email:welcome", "email:nudge", "email:review-request", "email:reminder", "sequence:guest-nurture"];

export function AutomationBuilder({ initial, live }: { initial: Automation[]; live: boolean }) {
  const [rules, setRules] = useState<Automation[]>(initial);
  const [adding, setAdding] = useState(false);

  function toggle(a: Automation) {
    setRules((all) => all.map((x) => (x.id === a.id ? { ...x, active: !x.active } : x)));
    fetch("/api/automations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggle", id: a.id, active: !a.active }) }).catch(() => {});
  }
  function add(form: FormData) {
    const a: Automation = { id: newId("AU"), name: String(form.get("name") || "New rule"), trigger: String(form.get("trigger")), action: String(form.get("action")), active: true, runs: 0 };
    setRules((all) => [...all, a]);
    setAdding(false);
    fetch("/api/automations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", name: a.name, trigger: a.trigger, actionType: a.action }) }).catch(() => {});
  }

  return (
    <Panel title={<span className="flex items-center gap-2"><Zap size={16} className="text-brass" /> Automation rules</span>}
      action={<button onClick={() => setAdding((v) => !v)} className="text-sm font-medium text-brass hover:underline"><Plus size={13} className="inline" /> New rule</button>}>
      {adding && (
        <form action={add} className="mb-4 grid gap-2 rounded-xl bg-bone p-3 sm:grid-cols-4">
          <input name="name" placeholder="Rule name" className="rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm outline-none focus:border-brass" />
          <select name="trigger" className="rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm outline-none focus:border-brass">{triggerOptions.map((t) => <option key={t}>{t}</option>)}</select>
          <select name="action" className="rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm outline-none focus:border-brass">{actionOptions.map((a) => <option key={a} value={a}>{describeAction(a)}</option>)}</select>
          <button type="submit" className="btn btn-primary !py-2 !text-xs">Add</button>
        </form>
      )}
      <ul className="space-y-2">
        {rules.map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded-xl bg-bone p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{a.name}</p>
              <p className="truncate text-xs text-stone"><span className="font-mono">{a.trigger}</span> → {describeAction(a.action)} · {a.runs} runs</p>
            </div>
            <button onClick={() => toggle(a)} className={`ml-3 shrink-0 rounded-full px-3 py-1 text-xs font-medium ${a.active ? "bg-sage/15 text-sage-deep" : "bg-ink/8 text-stone"}`}>{a.active ? "Active" : "Paused"}</button>
          </li>
        ))}
      </ul>
      {!live && <p className="mt-3 text-xs text-stone">Demo — rules run automatically once Supabase + email/SMS are connected. Event triggers fire inline; time-based ones on a cron tick.</p>}
    </Panel>
  );
}
