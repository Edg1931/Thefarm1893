import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/guard";
import { getFees } from "@/lib/crm/data";
import { chargeAmount, lateCheckoutCharge } from "@/lib/crm/fees";

export const runtime = "nodejs";

export async function GET() {
  const { live, feeTypes, charges } = await getFees();
  return NextResponse.json({ live, feeTypes, charges });
}

/**
 * POST — change a rate, add a charge, waive one, or push unbilled charges onto
 * an invoice. Rates live in the DB precisely so the owner can adjust the
 * outside-vendor fee for a given season without waiting on a deploy.
 *
 * action: "rate" | "charge" | "waive" | "invoice"
 */
export async function POST(req: Request) {
  const denied = await requireRole("finance");
  if (denied) return denied;
  try {
    const b = await req.json();
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    if (b.action === "rate") {
      const { error } = await sb.from("fee_types").upsert({
        code: b.code, label: b.label, amount: Number(b.amount) || 0,
        unit: b.unit ?? "flat", grace_minutes: Number(b.graceMinutes) || 0,
        active: b.active !== false, notes: b.notes ?? null,
      }, { onConflict: "code" });
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true });
    }

    if (b.action === "charge") {
      const { feeTypes } = await getFees();
      const fee = feeTypes.find((f) => f.code === b.code);
      if (!fee) return NextResponse.json({ error: "Unknown fee code." }, { status: 400 });

      // Late checkout is quoted in minutes-late; the grace window is applied
      // server side so a 12-minute overrun can never be billed by accident.
      const resolved = b.minutesLate != null
        ? lateCheckoutCharge(Number(b.minutesLate) || 0, fee)
        : { hours: Number(b.quantity) || 1, amount: chargeAmount(fee, Number(b.quantity) || 1) };

      if (resolved.amount <= 0) {
        return NextResponse.json({ ok: true, persisted: false, skipped: "within grace window" });
      }
      const { error } = await sb.from("fee_charges").insert({
        fee_code: fee.code, lead_id: b.leadId ?? null, event_id: b.eventId ?? null,
        quantity: resolved.hours, amount: resolved.amount, reason: b.reason ?? fee.label,
      });
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true, amount: resolved.amount });
    }

    if (b.action === "waive") {
      const { error } = await sb.from("fee_charges").update({ waived: true }).eq("id", b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true });
    }

    if (b.action === "invoice") {
      const ids: string[] = Array.isArray(b.ids) ? b.ids : [b.id].filter(Boolean);
      if (!ids.length) return NextResponse.json({ error: "Nothing to invoice." }, { status: 400 });
      const { error } = await sb.from("fee_charges").update({ invoice_id: b.invoiceId ?? null }).in("id", ids);
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true, count: ids.length });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (e) {
    console.error("[api] fees", e);
    return NextResponse.json({ error: "Could not save the fee." }, { status: 500 });
  }
}
