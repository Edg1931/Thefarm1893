import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/services/portal-auth";
import { getServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** POST — a token-bearing guest completes self check-in. No account required. */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = verifyToken(token);
  if (!payload || payload.scope !== "checkin") {
    return NextResponse.json({ error: "This check-in link is invalid or expired." }, { status: 401 });
  }
  try {
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false, subjectId: payload.id });
    await sb.from("silo_guests").update({ status: "checked-in" }).eq("id", payload.id);
    await sb.from("access_tokens").update({ used_at: new Date().toISOString() }).eq("token", token);
    return NextResponse.json({ ok: true, persisted: true, subjectId: payload.id });
  } catch {
    return NextResponse.json({ error: "Could not complete check-in." }, { status: 500 });
  }
}
