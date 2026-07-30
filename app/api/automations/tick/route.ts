import { NextResponse } from "next/server";
import { runTrigger } from "@/lib/services/automations";

export const runtime = "nodejs";

/**
 * Time-based automation tick — meant for Vercel Cron
 * (`{ "path": "/api/automations/tick", "schedule": "0 * * * *" }`). Fires
 * schedule-driven triggers (balance reminders, anniversary re-engagement, etc.).
 * Optionally protected by CRON_SECRET.
 */
async function run(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  // Time-based triggers evaluated each tick. Event-based ones fire inline from
  // their API routes; these are the scheduled sweeps.
  const triggers = ["invoice.due-14d", "stay.checkout+3d", "anniversary"];
  let fired = 0;
  for (const t of triggers) {
    const r = await runTrigger(t);
    fired += r.fired;
  }
  return NextResponse.json({ ok: true, fired });
}

export async function GET(req: Request) { return run(req); }
export async function POST(req: Request) { return run(req); }
