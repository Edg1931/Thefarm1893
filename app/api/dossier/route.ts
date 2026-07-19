import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * Persist per-client dossier edits (vendor team, payments, checklist) as JSONB,
 * merged with what's already stored. Demo mode (no DB) is a graceful no-op —
 * the browser store keeps the edit locally.
 */
export async function PATCH(req: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const body = await req.json();
    const { leadId, ...patch } = body ?? {};
    if (!leadId) return NextResponse.json({ error: "leadId is required." }, { status: 400 });

    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    const { data: existing } = await sb.from("dossiers").select("data").eq("lead_id", leadId).maybeSingle();
    const merged = { ...((existing?.data as Record<string, unknown>) ?? {}), ...patch };
    const { error } = await sb.from("dossiers").upsert({ lead_id: leadId, data: merged, updated_at: new Date().toISOString() });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true });
  } catch (e) {
    console.error("dossier patch error", e);
    return NextResponse.json({ error: "Could not save dossier." }, { status: 500 });
  }
}
