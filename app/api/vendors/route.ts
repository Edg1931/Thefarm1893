import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Add a vendor. Writes to Supabase when configured; otherwise demo mode
 *  (the browser store is the source of truth until the DB is connected). */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.category) {
      return NextResponse.json({ error: "Name and category are required." }, { status: 400 });
    }
    const supabase = getServiceClient();
    if (supabase) {
      const { error } = await supabase.from("vendors").insert({
        name: body.name,
        category: body.category,
        tier: body.tier ?? "listed",
        status: "pending",
        commission_rate: Number(body.commissionRate) || 0,
        membership_fee: Number(body.membershipFee) || 0,
        contact_email: body.email ?? null,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true });
    }
    console.log("[VENDOR — demo mode]", body.name);
    return NextResponse.json({ ok: true, persisted: false });
  } catch (e) {
    console.error("vendor add error", e);
    return NextResponse.json({ error: "Could not add vendor." }, { status: 500 });
  }
}
