import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";
import { getConversations } from "@/lib/crm/data";

export const runtime = "nodejs";

/** GET — unified inbox threads across email / SMS / web chat / Airbnb / VRBO. */
export async function GET() {
  const { live, conversations } = await getConversations();
  return NextResponse.json({ live, conversations });
}

/** POST — send a reply on a thread. Demo = no-op 200; live records the message. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { conversationId, leadId, body } = await req.json();
    if (!body?.trim()) return NextResponse.json({ error: "body required" }, { status: 400 });
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    if (leadId) await sb.from("messages").insert({ lead_id: leadId, channel: "email", role: "outbound", body });
    if (conversationId) await sb.from("conversations").update({ last_at: new Date().toISOString(), unread: false }).eq("id", conversationId);
    return NextResponse.json({ ok: true, persisted: true });
  } catch { return NextResponse.json({ error: "Could not send." }, { status: 500 }); }
}
