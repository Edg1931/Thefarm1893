"use client";

import { useState } from "react";
import { Plus, Clock, Power, ShieldCheck } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { syncToApi, newId } from "@/lib/crm/store";
import type { StaffMember } from "@/lib/crm/operations";

export function StaffManager({ initial, live }: { initial: StaffMember[]; live: boolean }) {
  const [staff, setStaff] = useState<StaffMember[]>(initial);
  const [adding, setAdding] = useState(false);

  function toggleClock(m: StaffMember) {
    const clockedIn = Boolean(m.clockedInAt);
    setStaff((all) => all.map((x) => (x.id === m.id ? { ...x, clockedInAt: clockedIn ? null : new Date().toISOString() } : x)));
    syncToApi("/api/staff/clock", "POST", { staffId: m.id, action: clockedIn ? "out" : "in" });
  }
  function toggleActive(m: StaffMember) {
    setStaff((all) => all.map((x) => (x.id === m.id ? { ...x, active: !x.active } : x)));
    syncToApi("/api/staff", "POST", { action: "update", id: m.id, active: !m.active });
  }
  function add(form: FormData) {
    const perms = String(form.get("permissions") || "operations").split(",").map((s) => s.trim()).filter(Boolean);
    const m: StaffMember = { id: newId("ST"), name: String(form.get("name") || "New staff"), role: String(form.get("role") || "Staff"), permissions: perms, hourlyRate: Number(form.get("hourlyRate")) || 0, active: true, clockedInAt: null };
    setStaff((all) => [...all, m]);
    setAdding(false);
    syncToApi("/api/staff", "POST", { action: "create", name: m.name, role: m.role, permissions: perms, hourlyRate: m.hourlyRate });
  }

  const onDuty = staff.filter((m) => m.clockedInAt).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone"><b className="text-ink">{staff.filter((m) => m.active).length}</b> active · <b className="text-ink">{onDuty}</b> on the clock</p>
        <button onClick={() => setAdding((v) => !v)} className="btn btn-ghost !py-2 !text-xs"><Plus size={14} /> Add staff</button>
      </div>

      {adding && (
        <Panel title="Add staff member">
          <form action={add} className="grid gap-3 sm:grid-cols-4">
            <input name="name" placeholder="Name" required className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
            <input name="role" placeholder="Role" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="hourlyRate" type="number" placeholder="$/hr" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="permissions" placeholder="Permissions (comma-separated)" defaultValue="operations" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-3" />
            <button type="submit" className="btn btn-primary !py-2 !text-xs">Add</button>
          </form>
        </Panel>
      )}

      <Panel title="Team" className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-bone text-xs uppercase tracking-wider text-stone">
              <tr><th className="px-5 py-3.5 font-medium">Name</th><th className="px-5 py-3.5 font-medium">Role</th><th className="px-5 py-3.5 font-medium">Permissions</th><th className="px-5 py-3.5 font-medium">Rate</th><th className="px-5 py-3.5 font-medium">Time clock</th><th className="px-5 py-3.5 font-medium">Active</th></tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {staff.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-stone">No staff yet — add your team to enable permissions, the time clock, and payroll reporting.</td></tr>
              )}
              {staff.map((m) => (
                <tr key={m.id} className="hover:bg-bone/60">
                  <td className="px-5 py-3.5 font-medium text-ink">{m.name}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{m.role}</td>
                  <td className="px-5 py-3.5"><span className="flex flex-wrap gap-1">{m.permissions.map((p) => <span key={p} className="flex items-center gap-0.5 rounded-full bg-sage/12 px-2 py-0.5 text-[0.6rem] text-sage-deep"><ShieldCheck size={9} /> {p}</span>)}</span></td>
                  <td className="px-5 py-3.5 text-ink-soft">{m.hourlyRate ? `$${m.hourlyRate}/hr` : "—"}</td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleClock(m)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${m.clockedInAt ? "bg-sage/15 text-sage-deep" : "bg-bone text-stone hover:text-ink"}`}>
                      <Clock size={12} /> {m.clockedInAt ? "Clock out" : "Clock in"}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleActive(m)} aria-label="Toggle active" className={`inline-flex items-center gap-1 text-xs ${m.active ? "text-sage-deep" : "text-stone"}`}><Power size={13} /> {m.active ? "Active" : "Inactive"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      {!live && <p className="text-center text-xs text-stone">Demo — staff, permissions, and time-clock entries persist to Supabase once connected. Payroll reports read from clocked hours.</p>}
    </div>
  );
}
