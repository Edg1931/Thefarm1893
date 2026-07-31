import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/guard";
import { issueToken } from "@/lib/services/portal-auth";
import { getServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * POST { leadId, ttlDays? } — staff issue a signed, expiring portal link for a
 * client. The couple can open it with no account; the token binds the link to
 * that one booking. Logged to access_tokens for audit/revocation when live.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { leadId, ttlDays = 180 } = await req.json();
    if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });

    const token = issueToken("lead", String(leadId), "portal", Number(ttlDays) || 180);
    const origin = new URL(req.url).origin;
    const url = `${origin}/portal/${encodeURIComponent(leadId)}?t=${token}`;

    const sb = getServiceClient();
    if (sb) {
      const expires = new Date(Date.now() + (Number(ttlDays) || 180) * 86_400_000).toISOString();
      await sb.from("access_tokens").insert({
        token, subject_type: "lead", subject_id: String(leadId), scope: "portal", expires_at: expires,
      });
    }
    return NextResponse.json({ ok: true, url, persisted: Boolean(sb) });
  } catch {
    return NextResponse.json({ error: "Could not create a portal link." }, { status: 500 });
  }
}
