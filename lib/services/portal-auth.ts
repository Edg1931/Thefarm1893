/* ============================================================================
   PORTAL AUTH — two tiers, both demo-safe.
   1. Magic-link (Supabase signInWithOtp) for recurring identities (couple,
      vendor). Membership rows (portal_members) map an auth user to a booking.
   2. Per-booking signed token for zero-account access (guest check-in, one-off
      document sign). Tokens are HMAC-signed and stateless, so they verify with
      no database — the natural evolution of the old soft-privacy share link.
   In demo mode (no Supabase) the portals auto-authenticate to a sample identity
   so walkthroughs need no inbox.
   ============================================================================ */

import crypto from "node:crypto";

export function portalAuthConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function secret(): string {
  return process.env.PORTAL_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "farm1893-dev-portal-secret";
}

export type TokenScope = "checkin" | "sign" | "portal";
export type TokenPayload = { t: string; id: string; scope: TokenScope; exp: number };

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}
function sign(data: string): string {
  return b64url(crypto.createHmac("sha256", secret()).update(data).digest());
}

/** Issue a signed, expiring access token for a subject (e.g. a silo booking). */
export function issueToken(subjectType: string, subjectId: string, scope: TokenScope, ttlDays = 30): string {
  const payload: TokenPayload = {
    t: subjectType,
    id: subjectId,
    scope,
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/** Verify a token's signature and expiry. Stateless — no DB needed. */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = sign(body);
    // constant-time compare
    if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(fromB64url(body).toString("utf8")) as TokenPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Demo identity used when Supabase auth isn't configured. */
export function mockSession(leadId?: string) {
  return { userId: "demo-user", leadId: leadId ?? "L-1042", role: "couple" as const, demo: true };
}
