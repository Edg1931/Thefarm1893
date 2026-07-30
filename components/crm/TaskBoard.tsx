"use client";

import { useState } from "react";
import { Plus, ArrowRight, Check, Sparkles, RotateCcw } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { formatDate } from "@/lib/utils";
import { syncToApi, newId } from "@/lib/crm/store";
import type { OpTask, TaskStatus } from "@/lib/crm/operations";

const columns: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Done" },
];
const catCls: Record<string, string> = {
  cleaning: "bg-sage/15 text-sage-deep", setup: "bg-brass/15 text-brass",
  lawn: "bg-sage-deep/15 text-sage-deep", turnover: "bg-terracotta/15 text-terracotta", other: "bg-ink/8 text-ink-soft",
};
const next: Record<TaskStatus, TaskStatus | null> = { todo: "in_progress", in_progress: "done", done: null };

export function TaskBoard({ initial, live }: { initial: OpTask[]; live: boolean }) {
  const [tasks, setTasks] = useState<OpTask[]>(initial);
  const [adding, setAdding] = useState(false);

  function advance(t: OpTask) {
    const to = next[t.status] ?? "todo";
    setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, status: to } : x)));
    syncToApi("/api/ops/tasks", "POST", { action: "status", id: t.id, status: to });
  }
  function add(form: FormData) {
    const t: OpTask = {
      id: newId("T"), title: String(form.get("title") || "New task"),
      category: (String(form.get("category") || "other") as OpTask["category"]),
      assignee: String(form.get("assignee") || "Unassigned"), dueAt: String(form.get("dueAt") || new Date().toISOString().slice(0, 10)), status: "todo",
    };
    setTasks((all) => [t, ...all]);
    setAdding(false);
    syncToApi("/api/ops/tasks", "POST", { action: "create", title: t.title, category: t.category, assignee: t.assignee, dueAt: t.dueAt });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone">{tasks.filter((t) => t.status !== "done").length} open · {tasks.filter((t) => t.status === "done").length} done</p>
        <button onClick={() => setAdding((v) => !v)} className="btn btn-ghost !py-2 !text-xs"><Plus size={14} /> Add task</button>
      </div>

      {adding && (
        <Panel title="New task">
          <form action={add} className="grid gap-3 sm:grid-cols-4">
            <input name="title" placeholder="Task" required className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
            <select name="category" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass">
              {["cleaning", "setup", "lawn", "turnover", "other"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input name="assignee" placeholder="Assignee" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="dueAt" type="date" className="rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass sm:col-span-2" />
            <button type="submit" className="btn btn-primary !py-2 !text-xs sm:col-span-2">Add</button>
          </form>
        </Panel>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key} className="rounded-2xl bg-parchment p-4 shadow-[var(--shadow-soft)]">
              <p className="mb-3 flex items-center justify-between text-sm font-medium text-ink">{col.label}<span className="rounded-full bg-bone px-2 py-0.5 text-xs text-stone">{items.length}</span></p>
              <div className="space-y-2.5">
                {items.length === 0 && <p className="rounded-xl bg-bone p-3 text-center text-xs text-stone">Nothing here.</p>}
                {items.map((t) => (
                  <div key={t.id} className="rounded-xl border border-ink/8 bg-bone p-3">
                    <p className="text-sm font-medium text-ink">{t.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[0.65rem]">
                      <span className={`rounded-full px-2 py-0.5 capitalize ${catCls[t.category]}`}>{t.category}</span>
                      <span className="text-stone">{t.assignee}</span>
                      {t.dueAt && <span className="text-stone">· {formatDate(t.dueAt)}</span>}
                      {t.recurring && <span className="flex items-center gap-0.5 text-stone"><RotateCcw size={9} /> {t.recurring}</span>}
                    </div>
                    <button onClick={() => advance(t)} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brass hover:underline">
                      {t.status === "done" ? <><RotateCcw size={12} /> Reopen</> : t.status === "in_progress" ? <><Check size={12} /> Mark done</> : <><ArrowRight size={12} /> Start</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {!live && <p className="flex items-center justify-center gap-1.5 text-xs text-stone"><Sparkles size={12} /> Demo — task changes sync to Supabase automatically once connected.</p>}
    </div>
  );
}
