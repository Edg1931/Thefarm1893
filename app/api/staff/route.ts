import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/guard";
import { getStaff } from "@/lib/crm/data";

export const runtime = "nodejs";

export async function GET() {
  const { live, staff } = await getStaff();
  return NextResponse.json({ live, staff });
}

/** POST — add a staff member or toggle active / update permissions. */
export async function POST(req: Request) {
  const denied = await requireRole("staff");
  if (denied) return denied;
  try {
    const b = await req.json();
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    if (b.action === "update") {
      const patch: Record<string, unknown> = {};
      if (typeof b.active === "boolean") patch.active = b.active;
      if (Array.isArray(b.permissions)) patch.permissions = b.permissions;
      if (b.role) patch.role = b.role;
      const { error } = await sb.from("staff").update(patch).eq("id", b.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("staff").insert({
        name: b.name, role: b.role ?? "Staff", permissions: b.permissions ?? [], hourly_rate: Number(b.hourlyRate) || 0, active: true,
      });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch { return NextResponse.json({ error: "Could not save staff." }, { status: 500 }); }
}
