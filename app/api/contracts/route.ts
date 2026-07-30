import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";
import { signingLink } from "@/lib/services/esign";
import { sendEmail } from "@/lib/services/email";

export const runtime = "nodejs";

/**
 * POST — create a contract (action: "create") or send it for signature
 * (action: "send"). Returns a native signing link. Staff-gated in live mode;
 * demo mode returns a working link so the flow can be walked through.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { action = "create", contractId, clientName, email, eventType, eventDate, value, deposit } = body ?? {};
    const origin = new URL(req.url).origin;
    const sb = getServiceClient();

    if (action === "send") {
      const id = contractId ?? "demo-contract";
      const { url, provider } = signingLink(origin, id);
      if (sb) {
        await sb.from("contracts").update({ status: "sent" }).eq("id", id);
        if (email) await sendEmail({ to: email, subject: "Your contract from The Farm 1893", html: `<p>Your contract is ready to sign.</p><p><a href="${url}">Review &amp; sign →</a></p>` });
      }
      return NextResponse.json({ ok: true, persisted: Boolean(sb), signUrl: url, provider });
    }

    // create
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    const { data, error } = await sb.from("contracts").insert({
      client_name: clientName ?? "New Client", event_type: eventType ?? "Wedding",
      event_date: eventDate ?? null, value: Number(value) || 0, deposit: Number(deposit) || 0, status: "draft",
    }).select("id").maybeSingle();
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true, id: data?.id });
  } catch {
    return NextResponse.json({ error: "Could not process the contract." }, { status: 500 });
  }
}
