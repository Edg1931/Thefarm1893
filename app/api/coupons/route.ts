import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin, clientIp, rateLimit, tooMany } from "@/lib/api/guard";
import { getCoupons } from "@/lib/crm/data";
import { couponValid } from "@/lib/crm/comms";

export const runtime = "nodejs";

/** GET — list coupons, or ?validate=CODE for a public validity check. */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("validate");
  if (code) {
    if (!rateLimit(`coupon:${clientIp(req)}`, 20, 60_000)) return tooMany();
    const { coupons } = await getCoupons();
    const c = coupons.find((x) => x.code.toUpperCase() === code.toUpperCase());
    if (!c || !couponValid(c)) return NextResponse.json({ valid: false });
    return NextResponse.json({ valid: true, kind: c.kind, amount: c.amount });
  }
  const { live, coupons } = await getCoupons();
  return NextResponse.json({ live, coupons });
}

/** POST — create a coupon (staff). Demo = no-op 200. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const b = await req.json();
    if (!b.code) return NextResponse.json({ error: "code required" }, { status: 400 });
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    const { error } = await sb.from("coupons").insert({
      code: String(b.code).toUpperCase(), kind: b.kind ?? "percent", amount: Number(b.amount) || 0,
      expires_at: b.expiresAt ?? null, max_uses: Number(b.maxUses) || 0, active: true,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true });
  } catch { return NextResponse.json({ error: "Could not save the coupon." }, { status: 500 }); }
}
