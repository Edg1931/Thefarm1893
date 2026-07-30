import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/guard";

export const runtime = "nodejs";

/** POST — clock a staff member in or out. action: "in" | "out". */
export async function POST(req: Request) {
  const denied = await requireRole("operations");
  if (denied) return denied;
  try {
    const { staffId, action } = await req.json();
    if (!staffId) return NextResponse.json({ error: "staffId required" }, { status: 400 });
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    if (action === "out") {
      const { data } = await sb.from("time_entries").select("id").eq("staff_id", staffId).is("clock_out", null).order("clock_in", { ascending: false }).limit(1).maybeSingle();
      if (data) await sb.from("time_entries").update({ clock_out: new Date().toISOString() }).eq("id", data.id);
    } else {
      await sb.from("time_entries").insert({ staff_id: staffId, clock_in: new Date().toISOString() });
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch { return NextResponse.json({ error: "Could not update the time clock." }, { status: 500 }); }
}
