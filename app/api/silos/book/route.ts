import { NextResponse } from "next/server";
import { checkSiloNights } from "@/lib/services/availability";
import { clientIp, rateLimit, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * POST — validates a silo stay against real availability BEFORE checkout, so two
 * guests can't book the same nights. Returns 409 with the conflicting dates if
 * the silo is taken; otherwise 200 and the caller proceeds to /api/checkout.
 * Public + rate-limited (it's called from the booking widget).
 */
export async function POST(req: Request) {
  if (!rateLimit(`silo-book:${clientIp(req)}`, 30, 60_000)) return tooMany();
  try {
    const { slug, checkIn, nights } = await req.json();
    if (!slug || !checkIn) return NextResponse.json({ error: "slug and checkIn required" }, { status: 400 });
    const n = Math.max(1, Number(nights) || 1);

    const { available, conflictDates } = await checkSiloNights(slug, checkIn, n);
    if (!available) {
      return NextResponse.json(
        { available: false, conflictDates, message: "Those nights are no longer available. Please pick different dates." },
        { status: 409 }
      );
    }
    return NextResponse.json({ available: true, slug, checkIn, nights: n });
  } catch {
    return NextResponse.json({ error: "Could not check availability." }, { status: 500 });
  }
}
