import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/guard";
import { getInventory } from "@/lib/crm/data";

export const runtime = "nodejs";

export async function GET() {
  const { live, items, lowCount } = await getInventory();
  return NextResponse.json({ live, items, lowCount });
}

/** POST — create an item or adjust its quantity. action: "create" | "adjust". */
export async function POST(req: Request) {
  const denied = await requireRole("operations");
  if (denied) return denied;
  try {
    const b = await req.json();
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    if (b.action === "adjust") {
      const { error } = await sb.from("inventory_items").update({ quantity: b.quantity }).eq("id", b.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("inventory_items").insert({
        name: b.name, category: b.category ?? "Other", quantity: Number(b.quantity) || 0,
        par_level: Number(b.parLevel) || 0, unit: b.unit ?? "units",
      });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch { return NextResponse.json({ error: "Could not save the item." }, { status: 500 }); }
}
