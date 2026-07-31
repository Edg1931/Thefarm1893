import { NextResponse } from "next/server";
import { requireAdmin, clientIp, rateLimit, tooMany } from "@/lib/api/guard";
import { draftReply } from "@/lib/services/reply-draft";

export const runtime = "nodejs";

/**
 * POST { message, clientName?, eventDate?, packageName?, balanceDue?, channel? }
 * Returns an AI-drafted staff reply grounded in that booking's context.
 * Staff-only and rate-limited (it can spend AI credits).
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  if (!rateLimit(`draft:${clientIp(req)}`, 30, 60_000)) return tooMany();
  try {
    const { message, clientName, eventDate, packageName, balanceDue, channel } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "message required" }, { status: 400 });

    const { draft, mocked } = await draftReply(String(message).slice(0, 2000), {
      clientName, eventDate, packageName, balanceDue: Number(balanceDue) || 0, channel,
    });
    return NextResponse.json({ ok: true, draft, mocked });
  } catch {
    return NextResponse.json({ error: "Could not draft a reply." }, { status: 500 });
  }
}
