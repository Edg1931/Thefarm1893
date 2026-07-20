import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/services/payments";
import { rateLimit, clientIp, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * Starts a checkout for a silo booking, deposit, or balance. Returns a Stripe
 * hosted URL when configured, or a demo success URL otherwise. Public (guests
 * pay) but rate-limited.
 */
export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientIp(req)}`, 12, 60_000)) return tooMany();
  try {
    const { amount, description, email, kind, metadata } = await req.json();
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents < 50) {
      return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
    }
    const origin = new URL(req.url).origin;
    const params = new URLSearchParams({ kind: String(kind ?? "payment") });
    const { url, demo } = await createCheckoutSession({
      amountCents: cents,
      description: String(description || "The Farm 1893"),
      email: email ? String(email) : undefined,
      successUrl: `${origin}/payment/success?${params.toString()}`,
      cancelUrl: `${origin}/payment/cancelled`,
      metadata: { kind: String(kind ?? "payment"), ...(metadata ?? {}) },
    });
    return NextResponse.json({ ok: true, url, demo });
  } catch (e) {
    console.error("checkout error", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed." }, { status: 500 });
  }
}
