import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/guard";
import { getTurnovers } from "@/lib/crm/data";
import { BENCHMARKS, checklistFor, costOf, type UnitKind } from "@/lib/crm/turnover";

export const runtime = "nodejs";

export async function GET() {
  const { live, turnovers } = await getTurnovers();
  return NextResponse.json({ live, turnovers });
}

/**
 * POST — schedule a clean, start/finish the timer, tick a checklist item, or
 * file a damage/missing report.
 *
 * Finishing is where the value is: actual minutes and cost are computed and
 * written here (server side) so "what did this clean actually cost?" is a
 * column, not a recollection. A matching `expenses` row is written at the same
 * time, which is what keeps the books current without a second data-entry pass.
 *
 * action: "create" | "start" | "finish" | "task" | "issue"
 */
export async function POST(req: Request) {
  const denied = await requireRole("operations");
  if (denied) return denied;
  try {
    const b = await req.json();
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    if (b.action === "create") {
      const kind = (b.unitKind ?? "silo") as UnitKind;
      const bench = BENCHMARKS[kind] ?? BENCHMARKS.silo;
      const expected = Math.round((bench.min + bench.max) / 2);
      const { data, error } = await sb.from("turnovers").insert({
        resource_slug: b.resourceSlug ?? "venue",
        unit_kind: kind,
        scheduled_for: b.scheduledFor ?? new Date().toISOString().slice(0, 10),
        cleaner_name: b.cleanerName ?? null,
        hourly_rate: Number(b.hourlyRate) || 45,
        expected_minutes: expected,
        notes: b.notes ?? null,
      }).select("id").single();
      if (error) throw error;
      // Seed the unit's standard checklist so nothing depends on memory.
      const tasks = checklistFor(kind).map((t, i) => ({ turnover_id: data.id, label: t.label, category: t.category, sort_order: i }));
      if (tasks.length) await sb.from("turnover_tasks").insert(tasks);
      return NextResponse.json({ ok: true, persisted: true, id: data.id });
    }

    if (b.action === "start") {
      const { error } = await sb.from("turnovers")
        .update({ status: "in_progress", started_at: new Date().toISOString() })
        .eq("id", b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true });
    }

    if (b.action === "finish") {
      const { data: row, error: readErr } = await sb.from("turnovers")
        .select("started_at,hourly_rate,cleaner_name,resource_slug").eq("id", b.id).single();
      if (readErr) throw readErr;

      const finishedAt = new Date();
      // Trust the client's stopwatch only when there's no server start stamp.
      const fromStart = row?.started_at
        ? Math.max(1, Math.round((finishedAt.getTime() - new Date(String(row.started_at)).getTime()) / 60000))
        : null;
      const minutes = Number(b.actualMinutes) > 0 ? Number(b.actualMinutes) : (fromStart ?? 0);
      const rate = Number(row?.hourly_rate) || 45;
      const cost = costOf(minutes, rate);

      const { error } = await sb.from("turnovers").update({
        status: "done", finished_at: finishedAt.toISOString(), actual_minutes: minutes, cost,
      }).eq("id", b.id);
      if (error) throw error;

      // Book the labour cost immediately — this is the accounting-time saving.
      if (cost > 0) {
        await sb.from("expenses").insert({
          incurred_on: finishedAt.toISOString().slice(0, 10),
          category: "cleaning",
          vendor: row?.cleaner_name ?? "Cleaning",
          description: `Turnover — ${row?.resource_slug ?? "unit"} (${minutes} min @ $${rate}/hr)`,
          amount: cost,
          turnover_id: b.id,
        });
      }
      return NextResponse.json({ ok: true, persisted: true, actualMinutes: minutes, cost });
    }

    if (b.action === "task") {
      const { error } = await sb.from("turnover_tasks").update({ done: Boolean(b.done) }).eq("id", b.taskId);
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true });
    }

    if (b.action === "issue") {
      const { error } = await sb.from("turnover_issues").insert({
        turnover_id: b.id, kind: b.kind ?? "damage",
        description: b.description ?? "Reported issue", est_cost: Number(b.estCost) || 0,
      });
      if (error) throw error;
      // A damage report the owner never sees is worthless — flag the clean too.
      await sb.from("turnovers").update({ status: "flagged" }).eq("id", b.id).eq("status", "done");
      return NextResponse.json({ ok: true, persisted: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) {
    console.error("[api] turnovers", e);
    return NextResponse.json({ error: "Could not save the turnover." }, { status: 500 });
  }
}
