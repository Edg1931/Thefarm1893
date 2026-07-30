import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";
import { getInvoices } from "@/lib/crm/data";
import { buildInstallmentSchedule } from "@/lib/services/payments";

export const runtime = "nodejs";

/** GET — list invoices (live rows or sample). */
export async function GET() {
  const { live, invoices, outstanding, collected } = await getInvoices();
  return NextResponse.json({ live, invoices, outstanding, collected });
}

/**
 * POST — create a single invoice, or an installment schedule for a booking.
 * action: "createSchedule" (leadId, total, eventDate, depositPct?, installments?)
 *         "create" (leadId, label, amount, dueDate)
 * Staff-gated in live mode; demo = no-op 200.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { action = "create" } = body ?? {};
    const sb = getServiceClient();

    if (action === "createSchedule") {
      const schedule = buildInstallmentSchedule(Number(body.total) || 0, String(body.eventDate ?? ""), {
        depositPct: body.depositPct, installments: body.installments,
      });
      if (!sb) return NextResponse.json({ ok: true, persisted: false, schedule });
      const rows = schedule.map((s) => ({ lead_id: body.leadId ?? null, label: s.label, amount: s.amount, due_date: s.dueDate, status: "draft" }));
      const { error } = await sb.from("invoices").insert(rows);
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true, schedule });
    }

    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    const { error } = await sb.from("invoices").insert({
      lead_id: body.leadId ?? null, label: body.label ?? "Invoice", amount: Number(body.amount) || 0,
      due_date: body.dueDate ?? null, status: body.status ?? "draft",
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ error: "Could not save the invoice." }, { status: 500 });
  }
}
