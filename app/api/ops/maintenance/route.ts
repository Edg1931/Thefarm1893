import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/guard";
import { getMaintenance } from "@/lib/crm/data";

export const runtime = "nodejs";

export async function GET() {
  const { live, assets, dueCount } = await getMaintenance();
  return NextResponse.json({ live, assets, dueCount });
}

/**
 * POST — create an asset or log a completed service (which rolls the next
 * service date forward by the asset's interval). action: "create" | "log".
 */
export async function POST(req: Request) {
  const denied = await requireRole("operations");
  if (denied) return denied;
  try {
    const b = await req.json();
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    if (b.action === "log") {
      const nowIso = new Date().toISOString();
      await sb.from("maintenance_logs").insert({ asset_id: b.id, note: b.note ?? "Serviced", cost: Number(b.cost) || 0, serviced_at: nowIso });
      const next = new Date(); next.setDate(next.getDate() + (Number(b.intervalDays) || 90));
      const { error } = await sb.from("maintenance_assets").update({ last_service: nowIso.slice(0, 10), next_service: next.toISOString().slice(0, 10) }).eq("id", b.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("maintenance_assets").insert({
        name: b.name, kind: b.kind ?? "other", last_service: b.lastService ?? null,
        next_service: b.nextService ?? null, interval_days: Number(b.intervalDays) || 90,
      });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch { return NextResponse.json({ error: "Could not save maintenance." }, { status: 500 }); }
}
