import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/guard";
import { getOpsTasks } from "@/lib/crm/data";

export const runtime = "nodejs";

export async function GET() {
  const { live, tasks } = await getOpsTasks();
  return NextResponse.json({ live, tasks });
}

/** POST — create a task or update its status. action: "create" | "status". */
export async function POST(req: Request) {
  const denied = await requireRole("operations");
  if (denied) return denied;
  try {
    const b = await req.json();
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    if (b.action === "status") {
      const { error } = await sb.from("op_tasks").update({ status: b.status }).eq("id", b.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("op_tasks").insert({
        title: b.title, category: b.category ?? "other", assignee_name: b.assignee ?? null,
        due_at: b.dueAt ?? null, status: "todo", recurring: b.recurring ?? null,
      });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch { return NextResponse.json({ error: "Could not save the task." }, { status: 500 }); }
}
