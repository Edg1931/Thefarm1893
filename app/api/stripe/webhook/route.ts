import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Verify Stripe's `t=...,v1=...` signature over `${t}.${rawBody}`. */
function verifySignature(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts: Record<string, string> = {};
  for (const kv of header.split(",")) {
    const [k, v] = kv.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }
  if (!parts.t || !parts.v1) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${parts.t}.${raw}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
  } catch {
    return false;
  }
}

/**
 * Stripe webhook — point your Stripe dashboard's "checkout.session.completed"
 * event here. Verifies the signature (when STRIPE_WEBHOOK_SECRET is set) and
 * logs the payment to the DB so deposits/balances auto-reconcile in the CRM.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const raw = await req.text();

  if (secret && !verifySignature(raw, req.headers.get("stripe-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data?.object ?? {};
    const meta = (s.metadata ?? {}) as Record<string, string>;
    const sb = getServiceClient();
    if (sb) {
      try {
        const paidAt = new Date().toISOString();
        // Log the settled transaction (the receipt ledger).
        await sb.from("payments").insert({
          amount: (Number(s.amount_total) || 0) / 100,
          status: "paid",
          stripe_id: (s.id as string) ?? null,
          created_at: paidAt,
        });
        // Reconcile the invoice this payment settles, if any.
        if (meta.invoiceId) {
          await sb.from("invoices").update({ status: "paid", paid_at: paidAt, stripe_id: (s.id as string) ?? null }).eq("id", meta.invoiceId);
        }
        // Mark a contract's deposit paid when the deposit clears.
        if (meta.contractId && meta.kind === "deposit") {
          await sb.from("contracts").update({ deposit_paid: true, status: "paid" }).eq("id", meta.contractId);
        }
      } catch (e) {
        console.error("stripe webhook log error", e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
