"use client";

import { useMemo, useState } from "react";
import {
  Sparkles, Play, Square, Camera, AlertTriangle, Plus, Timer,
  TrendingDown, TrendingUp, CircleCheck, DollarSign,
} from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { Toast } from "@/components/crm/Toast";
import { DemoBanner } from "@/components/crm/DemoBanner";
import { syncToApi, newId } from "@/lib/crm/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  BENCHMARKS, EVENT_CLEAN_BUDGET, RATE_BANDS, checklistFor, costOf, fmtMinutes, varianceOf,
  type Turnover, type UnitKind,
} from "@/lib/crm/turnover";

const UNIT_LABEL: Record<string, string> = {
  venue: "Main venue", "the-orchard-silo": "Orchard Silo", "the-harvest-silo": "Harvest Silo",
  "the-copper-silo": "Copper Silo", "the-meadow-silo": "Meadow Silo",
};

const STATUS_STYLE: Record<Turnover["status"], string> = {
  scheduled: "bg-ink/8 text-stone",
  in_progress: "bg-brass/15 text-brass",
  done: "bg-sage/15 text-sage-deep",
  flagged: "bg-terracotta/15 text-terracotta",
};

export function TurnoverBoard({ initial, live }: { initial: Turnover[]; live: boolean }) {
  const [rows, setRows] = useState<Turnover[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const say = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const patch = (id: string, fn: (t: Turnover) => Turnover) =>
    setRows((all) => all.map((t) => (t.id === id ? fn(t) : t)));

  /* ---- the numbers the owner actually asked for ------------------------- */
  const stats = useMemo(() => {
    const done = rows.filter((t) => t.actualMinutes != null);
    const spend = done.reduce((s, t) => s + (t.cost ?? 0), 0);
    const over = done.filter((t) => varianceOf(t)?.state === "over").length;
    const openIssues = rows.flatMap((t) => t.issues).filter((i) => !i.resolved);
    const avgSilo = (() => {
      const silos = done.filter((t) => t.unitKind === "silo");
      return silos.length ? Math.round(silos.reduce((s, t) => s + (t.actualMinutes ?? 0), 0) / silos.length) : null;
    })();
    return { count: done.length, spend, over, openIssues, avgSilo };
  }, [rows]);

  /* ---- actions ---------------------------------------------------------- */
  function start(t: Turnover) {
    patch(t.id, (x) => ({ ...x, status: "in_progress" }));
    syncToApi("/api/ops/turnovers", "POST", { action: "start", id: t.id });
    say("Clock started.");
  }

  function finish(t: Turnover, minutes: number) {
    const cost = costOf(minutes, t.hourlyRate);
    patch(t.id, (x) => ({ ...x, status: "done", actualMinutes: minutes, cost }));
    syncToApi("/api/ops/turnovers", "POST", { action: "finish", id: t.id, actualMinutes: minutes });
    const b = BENCHMARKS[t.unitKind];
    say(minutes > b.max ? `Logged — ${fmtMinutes(minutes - b.max)} over benchmark.` : `Logged at ${formatCurrency(cost)}.`);
  }

  function toggleTask(t: Turnover, taskId: string) {
    const next = !t.tasks.find((x) => x.id === taskId)?.done;
    patch(t.id, (x) => ({ ...x, tasks: x.tasks.map((tk) => (tk.id === taskId ? { ...tk, done: next } : tk)) }));
    syncToApi("/api/ops/turnovers", "POST", { action: "task", id: t.id, taskId, done: next });
  }

  function reportIssue(t: Turnover, form: FormData) {
    const issue = {
      id: newId("I"),
      kind: String(form.get("kind") || "damage") as Turnover["issues"][number]["kind"],
      description: String(form.get("description") || "Reported issue"),
      estCost: Number(form.get("estCost")) || 0,
      resolved: false,
    };
    patch(t.id, (x) => ({ ...x, issues: [...x.issues, issue], status: x.status === "done" ? "flagged" : x.status }));
    syncToApi("/api/ops/turnovers", "POST", {
      action: "issue", id: t.id, kind: issue.kind, description: issue.description, estCost: issue.estCost,
    });
    say("Damage report filed.");
  }

  async function uploadPhoto(t: Turnover, file: File, phase: "before" | "after" | "damage") {
    try {
      const res = await fetch(`/api/ops/turnovers/photo?turnoverId=${t.id}&name=${encodeURIComponent(file.name)}&phase=${phase}`);
      const up = await res.json();
      if (!up.demo && up.url) {
        await fetch(up.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        await fetch("/api/ops/turnovers/photo", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ turnoverId: t.id, path: up.path, phase }),
        });
      }
      patch(t.id, (x) => ({ ...x, photos: [...x.photos, { id: newId("P"), phase, path: up.path ?? file.name }] }));
      say(up.demo ? `${phase} photo captured (demo — connect storage to keep it).` : `${phase} photo saved.`);
    } catch { say("Could not upload that photo."); }
  }

  function schedule(form: FormData) {
    const kind = String(form.get("unitKind") || "silo") as UnitKind;
    const b = BENCHMARKS[kind];
    const t: Turnover = {
      id: newId("TO"),
      resourceSlug: String(form.get("resourceSlug") || "venue"),
      unitKind: kind,
      scheduledFor: String(form.get("scheduledFor") || new Date().toISOString().slice(0, 10)),
      status: "scheduled",
      cleanerName: String(form.get("cleanerName") || "Unassigned"),
      hourlyRate: Number(form.get("hourlyRate")) || 45,
      expectedMinutes: Math.round((b.min + b.max) / 2),
      actualMinutes: null, cost: null,
      tasks: checklistFor(kind).map((x, i) => ({ ...x, id: `${newId("T")}-${i}`, done: false })),
      issues: [], photos: [],
    };
    setRows((all) => [t, ...all]);
    setAdding(false);
    syncToApi("/api/ops/turnovers", "POST", {
      action: "create", resourceSlug: t.resourceSlug, unitKind: kind, scheduledFor: t.scheduledFor,
      cleanerName: t.cleanerName, hourlyRate: t.hourlyRate,
    });
    say("Clean scheduled with its checklist.");
  }

  return (
    <div className="space-y-6">
      <DemoBanner live={live} empty={live && rows.length === 0} what="turnovers"
        emptyMessage="You're live — schedule a clean below and every minute, photo, and cost will be tracked here." />

      {/* Cost-of-clean summary — the question the owner's notes open with */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={CircleCheck} label="Cleans logged" value={String(stats.count)} note="with real minutes recorded" />
        <Metric icon={DollarSign} label="Labour spent" value={formatCurrency(stats.spend)}
          note={`Budget guide ${formatCurrency(EVENT_CLEAN_BUDGET.min)}–${formatCurrency(EVENT_CLEAN_BUDGET.max)} per event`} />
        <Metric icon={Timer} label="Avg. silo turnover" value={stats.avgSilo ? fmtMinutes(stats.avgSilo) : "—"}
          note={`Benchmark ${BENCHMARKS.silo.min}–${BENCHMARKS.silo.max} min`} tone={stats.avgSilo && stats.avgSilo > BENCHMARKS.silo.max ? "warn" : "ok"} />
        <Metric icon={AlertTriangle} label="Open damage / missing" value={String(stats.openIssues.length)}
          note={stats.openIssues.length ? `${formatCurrency(stats.openIssues.reduce((s, i) => s + i.estCost, 0))} estimated` : "Nothing outstanding"}
          tone={stats.openIssues.length ? "warn" : "ok"} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone">
          Rate reference: independent ${RATE_BANDS.independent.min}–{RATE_BANDS.independent.max}/hr ·
          professional service ${RATE_BANDS.professional.min}–{RATE_BANDS.professional.max}/hr
        </p>
        <button onClick={() => setAdding((v) => !v)} className="btn btn-ghost !py-2 !text-xs"><Plus size={14} /> Schedule a clean</button>
      </div>

      {adding && (
        <Panel title="Schedule a turnover">
          <form action={schedule} className="grid gap-3 sm:grid-cols-3">
            <select name="resourceSlug" aria-label="Unit" className={inputCls}>
              {Object.entries(UNIT_LABEL).map(([slug, label]) => <option key={slug} value={slug}>{label}</option>)}
            </select>
            <select name="unitKind" aria-label="Unit type" className={inputCls}>
              {(Object.keys(BENCHMARKS) as UnitKind[]).map((k) => (
                <option key={k} value={k}>{BENCHMARKS[k].label} · {BENCHMARKS[k].min}–{BENCHMARKS[k].max} min</option>
              ))}
            </select>
            <input name="scheduledFor" type="date" aria-label="Date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} />
            <input name="cleanerName" placeholder="Cleaner" className={inputCls} />
            <input name="hourlyRate" type="number" step="1" placeholder="Hourly rate" defaultValue={45} aria-label="Hourly rate" className={inputCls} />
            <button type="submit" className="btn btn-primary !py-2 !text-xs">Schedule</button>
          </form>
        </Panel>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {rows.map((t) => (
          <TurnoverCard
            key={t.id} t={t}
            open={openId === t.id}
            onToggleOpen={() => setOpenId((id) => (id === t.id ? null : t.id))}
            onStart={() => start(t)}
            onFinish={(m) => finish(t, m)}
            onTask={(id) => toggleTask(t, id)}
            onIssue={(f) => reportIssue(t, f)}
            onPhoto={(file, phase) => uploadPhoto(t, file, phase)}
          />
        ))}
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

const inputCls = "rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass";

function Metric({ icon: Icon, label, value, note, tone = "ok" }: {
  icon: typeof Timer; label: string; value: string; note: string; tone?: "ok" | "warn";
}) {
  return (
    <div className={`rounded-2xl border p-5 ${tone === "warn" ? "border-terracotta/25 bg-terracotta/5" : "border-ink/8 bg-parchment"}`}>
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone"><Icon size={14} className="text-brass" /> {label}</p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-stone">{note}</p>
    </div>
  );
}

function TurnoverCard({ t, open, onToggleOpen, onStart, onFinish, onTask, onIssue, onPhoto }: {
  t: Turnover; open: boolean; onToggleOpen: () => void;
  onStart: () => void; onFinish: (minutes: number) => void;
  onTask: (taskId: string) => void; onIssue: (form: FormData) => void;
  onPhoto: (file: File, phase: "before" | "after" | "damage") => void;
}) {
  const [minutes, setMinutes] = useState<string>(String(t.expectedMinutes));
  const [reporting, setReporting] = useState(false);
  const bench = BENCHMARKS[t.unitKind];
  const v = varianceOf(t);
  const doneCount = t.tasks.filter((x) => x.done).length;
  const pct = t.tasks.length ? Math.round((doneCount / t.tasks.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-ink/8 bg-parchment p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-display text-xl text-ink">
            <Sparkles size={16} className="shrink-0 text-brass" /> {UNIT_LABEL[t.resourceSlug] ?? t.resourceSlug}
          </p>
          <p className="mt-1 text-xs text-stone">
            {bench.label} · {t.scheduledFor ? formatDate(t.scheduledFor) : "unscheduled"} · {t.cleanerName} · ${t.hourlyRate}/hr
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-wide ${STATUS_STYLE[t.status]}`}>
          {t.status.replace("_", " ")}
        </span>
      </div>

      {/* Benchmark vs actual — the whole point of tracking this */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-y border-ink/8 py-3 text-sm">
        <span className="text-stone">Benchmark <span className="text-ink-soft">{bench.min}–{bench.max} min</span></span>
        {t.actualMinutes != null ? (
          <>
            <span className="text-stone">Actual <span className="font-medium text-ink">{fmtMinutes(t.actualMinutes)}</span></span>
            <span className="text-stone">Cost <span className="font-medium text-ink">{formatCurrency(t.cost ?? 0)}</span></span>
            {v && v.state !== "on" && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                v.state === "over" ? "bg-terracotta/12 text-terracotta" : "bg-sage/15 text-sage-deep"}`}>
                {v.state === "over" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {fmtMinutes(Math.abs(v.deltaMin))} {v.state} benchmark
              </span>
            )}
            {v?.state === "on" && <span className="rounded-full bg-sage/15 px-2 py-0.5 text-xs font-medium text-sage-deep">On benchmark</span>}
          </>
        ) : (
          <span className="text-stone">Expected cost <span className="text-ink-soft">{formatCurrency(costOf(t.expectedMinutes, t.hourlyRate))}</span></span>
        )}
      </div>

      {/* Checklist progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-stone">
          <span>Checklist · {doneCount} of {t.tasks.length}</span>
          <button onClick={onToggleOpen} className="font-medium text-brass hover:underline">{open ? "Hide" : "Open"} checklist</button>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bone">
          <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {open && (
        <ul className="mt-3 space-y-1.5">
          {t.tasks.map((tk) => (
            <li key={tk.id}>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-bone">
                <input type="checkbox" checked={tk.done} onChange={() => onTask(tk.id)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-sage-deep)]" />
                <span className={tk.done ? "text-stone line-through" : "text-ink-soft"}>{tk.label}</span>
                <span className="ml-auto shrink-0 text-[0.6rem] uppercase tracking-wide text-stone">{tk.category}</span>
              </label>
            </li>
          ))}
          {t.tasks.length === 0 && <li className="px-2 py-1.5 text-sm text-stone">No checklist on this clean yet.</li>}
        </ul>
      )}

      {/* Issues already on file */}
      {t.issues.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {t.issues.map((i) => (
            <li key={i.id} className="flex items-start gap-2 rounded-lg bg-terracotta/6 px-3 py-2 text-xs text-ink-soft">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-terracotta" />
              <span><span className="font-medium capitalize text-ink">{i.kind}:</span> {i.description}</span>
              {i.estCost > 0 && <span className="ml-auto shrink-0 font-medium text-terracotta">{formatCurrency(i.estCost)}</span>}
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink/8 pt-4">
        {t.status === "scheduled" && (
          <button onClick={onStart} className="btn btn-primary !py-2 !text-xs"><Play size={13} /> Start clean</button>
        )}
        {t.status === "in_progress" && (
          <>
            <input value={minutes} onChange={(e) => setMinutes(e.target.value)} type="number" aria-label="Actual minutes"
              className="w-24 rounded-lg border border-ink/12 bg-bone px-2.5 py-2 text-sm outline-none focus:border-brass" />
            <button onClick={() => onFinish(Number(minutes) || t.expectedMinutes)} className="btn btn-primary !py-2 !text-xs"><Square size={13} /> Finish at {minutes || 0}m</button>
          </>
        )}

        <PhotoButton label="Before" onPick={(f) => onPhoto(f, "before")} />
        <PhotoButton label="After" onPick={(f) => onPhoto(f, "after")} />
        {t.photos.length > 0 && <span className="text-xs text-stone">{t.photos.length} photo{t.photos.length === 1 ? "" : "s"}</span>}

        <button onClick={() => setReporting((v2) => !v2)} className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-terracotta hover:underline">
          <AlertTriangle size={13} /> Report damage
        </button>
      </div>

      {reporting && (
        <form action={(f) => { onIssue(f); setReporting(false); }} className="mt-3 grid gap-2 rounded-xl bg-bone p-3 sm:grid-cols-4">
          <select name="kind" aria-label="Issue type" className={inputCls}>
            <option value="damage">Damage</option>
            <option value="missing">Missing item</option>
            <option value="maintenance">Needs maintenance</option>
          </select>
          <input name="description" placeholder="What happened?" required className={`${inputCls} sm:col-span-2`} />
          <input name="estCost" type="number" step="1" placeholder="Est. $" aria-label="Estimated cost" className={inputCls} />
          <button type="submit" className="btn btn-primary !py-2 !text-xs sm:col-span-4">File report</button>
        </form>
      )}
    </div>
  );
}

function PhotoButton({ label, onPick }: { label: string; onPick: (f: File) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-ink/12 px-2.5 py-2 text-xs text-ink-soft hover:border-brass/40">
      <Camera size={13} /> {label}
      <input type="file" accept="image/*" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
    </label>
  );
}
