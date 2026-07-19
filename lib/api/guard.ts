import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Returns the signed-in Supabase user (or null). Reads the auth cookie set by
 * the browser client. No-op (null) when Supabase isn't configured.
 */
export async function getUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const store = await cookies();
  const supabase = createServerClient(url, anon, {
    cookies: { getAll: () => store.getAll(), setAll: () => {} },
  });
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Gate for admin/mutation routes. When Supabase is configured, an authenticated
 * staff user is required (these routes use the service-role key and bypass RLS).
 * In demo mode (Supabase unconfigured) it stays open so the CRM works without a DB.
 * Returns a 401 Response to short-circuit, or null to proceed.
 */
export async function requireAdmin(): Promise<Response | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null; // demo mode — no gate
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  return null;
}

/* --- Best-effort in-memory rate limiter (per server instance) --- */
const buckets = new Map<string, { count: number; reset: number }>();

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown");
}

/** Returns true if allowed, false if the caller has exceeded `limit` in `windowMs`. */
export function rateLimit(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

export function tooMany(): Response {
  return NextResponse.json({ error: "Too many requests. Please slow down and try again." }, { status: 429 });
}
