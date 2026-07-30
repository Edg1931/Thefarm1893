import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { portalAuthConfigured } from "@/lib/services/portal-auth";
import { clientIp, rateLimit, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * POST { email } — request a passwordless magic link to the planning portal.
 * Demo mode (no Supabase) returns { demo: true } so the UI can link straight in.
 */
export async function POST(req: Request) {
  if (!rateLimit(`portal-session:${clientIp(req)}`, 8, 60_000)) return tooMany();
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

    if (!portalAuthConfigured()) return NextResponse.json({ ok: true, demo: true });

    const store = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => store.getAll(), setAll: () => {} } }
    );
    const { error } = await supabase.auth.signInWithOtp({ email: String(email).trim() });
    if (error) throw error;
    return NextResponse.json({ ok: true, sent: true });
  } catch {
    return NextResponse.json({ error: "Could not send the sign-in link." }, { status: 500 });
  }
}
