import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { clientIp, rateLimit, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";

/** POST — send a portal message (couple ⇄ staff ⇄ vendor). Demo = no-op 200. */
export async function POST(req: Request) {
  if (!rateLimit(`portal-msg:${clientIp(req)}`, 40, 60_000)) return tooMany();
  try {
    const { leadId, sender = "couple", body } = await req.json();
    if (!leadId || !body?.trim()) return NextResponse.json({ error: "leadId and body required" }, { status: 400 });

    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    const { error } = await sb.from("portal_messages").insert({ lead_id: leadId, sender, body: String(body).slice(0, 4000) });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ error: "Could not send that message." }, { status: 500 });
  }
}
