import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/services/portal-auth";
import { signatureAudit } from "@/lib/services/esign";
import { clientIp, rateLimitDurable, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * POST — a client signs a contract via their token-signed link. Public but
 * token-gated (no account) and durably rate-limited. Records the signature,
 * signer name/IP, and timestamp; marks the contract "signed". Demo = no-op 200.
 */
export async function POST(req: Request) {
  if (!(await rateLimitDurable(`sign:${clientIp(req)}`, 15, 60_000))) return tooMany();
  try {
    const { token, signerName, signatureData } = await req.json();
    const payload = verifyToken(String(token ?? ""));
    if (!payload || payload.scope !== "sign") {
      return NextResponse.json({ error: "This signing link is invalid or expired." }, { status: 401 });
    }
    if (!signerName?.trim()) return NextResponse.json({ error: "A signature is required." }, { status: 400 });

    const audit = signatureAudit(String(signerName).trim(), clientIp(req));
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false, ...audit });

    const { error } = await sb.from("contracts").update({
      status: "signed",
      signed_at: audit.signedAt,
      signer_ip: audit.ip,
      signer_name: audit.signerName,
      signature_data: signatureData ? String(signatureData).slice(0, 200_000) : null,
    }).eq("id", payload.id);
    if (error) throw error;
    await sb.from("access_tokens").update({ used_at: audit.signedAt }).eq("token", token);
    return NextResponse.json({ ok: true, persisted: true, ...audit });
  } catch {
    return NextResponse.json({ error: "Could not record the signature." }, { status: 500 });
  }
}
