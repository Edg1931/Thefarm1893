import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/services/email";

export const runtime = "nodejs";

/**
 * Payment-reminder tick — meant to run on a schedule (Vercel Cron:
 * `{ "path": "/api/reminders", "schedule": "0 14 * * *" }`). Finds due,
 * unsent reminders and emails the client. Demo mode reports a no-op. Optionally
 * protect with CRON_SECRET (Authorization: Bearer <secret>).
 */
async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const sb = getServiceClient();
  if (!sb) return NextResponse.json({ ok: true, persisted: false, sent: 0 });

  try {
    const nowIso = new Date().toISOString();
    const { data: due } = await sb
      .from("payment_reminders")
      .select("id, invoice_id, invoices(label, amount, due_date, lead_id, status)")
      .lte("send_at", nowIso)
      .is("sent_at", null)
      .limit(100);

    let sent = 0;
    for (const r of (due ?? []) as Record<string, unknown>[]) {
      const inv = (r.invoices ?? {}) as Record<string, unknown>;
      if (inv.status === "paid" || inv.status === "void") continue;
      // (Email address would be resolved from the lead; omitted for brevity in demo.)
      await sendEmail({ to: "client@example.com", subject: `Payment reminder — ${inv.label}`, html: `<p>A friendly reminder that ${inv.label} ($${inv.amount}) is due ${inv.due_date}.</p>` });
      await sb.from("payment_reminders").update({ sent_at: nowIso }).eq("id", r.id as string);
      sent++;
    }
    return NextResponse.json({ ok: true, persisted: true, sent });
  } catch {
    return NextResponse.json({ error: "Reminder run failed." }, { status: 500 });
  }
}

export async function GET(req: Request) { return run(req); }
export async function POST(req: Request) { return run(req); }
