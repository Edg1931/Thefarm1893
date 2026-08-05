import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/api/guard";
import { getExpenses } from "@/lib/crm/data";
import { toQuickBooksCsv } from "@/lib/crm/expenses";

export const runtime = "nodejs";

/**
 * GET — the expense ledger, or `?format=csv` for a QuickBooks-ready export.
 * The CSV path is deliberately a normal link download (no JS) so the owner's
 * accountant can be handed a URL and get the file.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const { live, expenses } = await getExpenses();

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const rows = expenses.filter((e) => (!from || e.incurredOn >= from) && (!to || e.incurredOn <= to));

  if (searchParams.get("format") === "csv") {
    const denied = await requireRole("finance");
    if (denied) return denied;
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(toQuickBooksCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="farm1893-expenses-${stamp}.csv"`,
      },
    });
  }
  return NextResponse.json({ live, expenses: rows });
}

export async function POST(req: Request) {
  const denied = await requireRole("finance");
  if (denied) return denied;
  try {
    const b = await req.json();
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    if (b.action === "delete") {
      const { error } = await sb.from("expenses").delete().eq("id", b.id);
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true });
    }

    const { error } = await sb.from("expenses").insert({
      incurred_on: b.incurredOn || new Date().toISOString().slice(0, 10),
      category: b.category ?? "other",
      vendor: b.vendor ?? null,
      description: b.description ?? null,
      amount: Number(b.amount) || 0,
      receipt_path: b.receiptPath ?? null,
      tax_deductible: b.taxDeductible !== false,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true });
  } catch (e) {
    console.error("[api] expenses", e);
    return NextResponse.json({ error: "Could not save the expense." }, { status: 500 });
  }
}
