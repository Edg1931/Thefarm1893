import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * POST — mutate the seating chart. Actions: addTable, removeTable, assign,
 * unassign. Staff-gated in live mode; couples edit their own chart through the
 * portal (which posts here). Demo = no-op 200.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, leadId } = body ?? {};
    if (!action || !leadId) return NextResponse.json({ error: "action and leadId required" }, { status: 400 });

    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    // Live writes are staff/authenticated only.
    const denied = await requireAdmin();
    if (denied) return denied;

    if (action === "addTable") {
      const { error } = await sb.from("seating_tables").insert({ lead_id: leadId, label: body.label ?? "New table", capacity: body.capacity ?? 8 });
      if (error) throw error;
    } else if (action === "removeTable") {
      const { error } = await sb.from("seating_tables").delete().eq("id", body.tableId).eq("lead_id", leadId);
      if (error) throw error;
    } else if (action === "assign") {
      const { error } = await sb.from("seating_assignments").insert({ table_id: body.tableId, guest_name: body.guestName, rsvp_id: body.rsvpId ?? null });
      if (error) throw error;
    } else if (action === "unassign") {
      const { error } = await sb.from("seating_assignments").delete().eq("id", body.assignmentId);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: "unknown action" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ error: "Could not update seating." }, { status: 500 });
  }
}
