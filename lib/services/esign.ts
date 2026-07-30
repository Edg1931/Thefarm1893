/* ============================================================================
   E-SIGNATURES — a lightweight NATIVE signing flow is the default: the client
   opens a token-signed link, draws/types their signature, and we store it with
   an audit trail (signed_at, signer_ip). No third-party account required.
   A seam is left for Dropbox Sign / DocuSign when a key is added later.
   Demo mode marks contracts "signed (demo)" so the flow completes end-to-end.
   ============================================================================ */

import { issueToken } from "@/lib/services/portal-auth";

/** True when an external provider is wired; otherwise the native flow is used. */
export function esignProviderConfigured(): boolean {
  return Boolean(process.env.DROPBOX_SIGN_API_KEY || process.env.DOCUSIGN_API_KEY);
}

/**
 * Produce a signing link for a contract. Native flow returns a token-signed
 * URL to /sign/[token]; a provider integration would return their hosted URL.
 */
export function signingLink(origin: string, contractId: string, ttlDays = 30): { url: string; provider: "native" | "external" } {
  const token = issueToken("contract", contractId, "sign", ttlDays);
  return { url: `${origin}/sign/${token}`, provider: esignProviderConfigured() ? "external" : "native" };
}

/** A tiny audit summary stored alongside the signature. */
export function signatureAudit(signerName: string, ip: string) {
  return { signerName, ip, signedAt: new Date().toISOString(), method: esignProviderConfigured() ? "external" : "native" };
}
