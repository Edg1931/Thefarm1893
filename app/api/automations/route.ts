import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";
import { getAutomations } from "@/lib/crm/data";

export const runtime = "nodejs";

export async function GET() {
  const { live, automations } = await getAutomations();
  return NextResponse.json({ live, automations });
}

/** POST — create a rule or toggle one active/paused. action: "create" | "toggle". */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const b = await req.json();
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    if (b.action === "toggle") {
      const { error } = await sb.from("automations").update({ active: b.active }).eq("id", b.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("automations").insert({ name: b.name, trigger: b.trigger, action: b.action, active: true });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch { return NextResponse.json({ error: "Could not save the automation." }, { status: 500 }); }
}
