/* ============================================================================
   EMAIL — pluggable transactional email via Resend. Activates when
   RESEND_API_KEY is set; until then it logs (mock) so flows that "send" an
   invoice, receipt, reminder, or magic link still complete in a walkthrough.
   Uses the Resend REST API directly — no SDK dependency.
   ============================================================================ */

import { business } from "@/lib/content";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Who mail comes FROM.
 *
 * Resend will only send from a domain you have verified with it. The old
 * default was hello@thefarm1893.com — a domain the venue doesn't control yet,
 * so every send would have been rejected the moment a Resend key was added.
 * Free webmail can't be verified either, so the gmail address can't be the
 * sender. `onboarding@resend.dev` is Resend's own shared sender and works with
 * no domain setup at all — the right interim default.
 *
 * Once the venue's domain is live: verify it in Resend and set EMAIL_FROM to
 * something like "The Farm 1893 <hello@thefarm1893.com>".
 */
const FROM = process.env.EMAIL_FROM || "The Farm 1893 <onboarding@resend.dev>";

/** Replies go to the venue's real inbox regardless of which sender was used. */
const REPLY_TO = process.env.EMAIL_REPLY_TO || business.email;

export type EmailInput = { to: string; subject: string; html: string; from?: string };

export async function sendEmail(input: EmailInput): Promise<{ ok: boolean; demo: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log("[email] (demo) would send:", { to: input.to, subject: input.subject });
    return { ok: true, demo: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: input.from ?? FROM,
        to: input.to,
        subject: input.subject,
        html: input.html,
        reply_to: REPLY_TO,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    return { ok: true, demo: false };
  } catch (e) {
    console.error("[email] send failed", e);
    return { ok: false, demo: false };
  }
}
