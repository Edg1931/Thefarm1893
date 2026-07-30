import { FileSignature, DoorOpen, Phone } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
import { SignaturePad } from "@/components/site/SignaturePad";
import { verifyToken } from "@/lib/services/portal-auth";
import { business } from "@/lib/content";

export const metadata = { title: "Sign your contract", robots: { index: false } };

export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = token === "demo" ? { scope: "sign" as const, id: "demo" } : verifyToken(token);
  const valid = Boolean(payload && payload.scope === "sign");

  if (!valid) {
    return (
      <PortalShell title="Signing link expired" subtitle="Let's get you a fresh one.">
        <div className="rounded-2xl border border-ink/8 bg-parchment p-8 text-center">
          <DoorOpen className="mx-auto text-brass" />
          <p className="mt-3 text-ink-soft">This signing link is invalid or has expired. Reach out and we&apos;ll resend it.</p>
          <a href={business.phoneHref} className="btn btn-primary mt-5"><Phone size={16} /> Call the Farm</a>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Your contract" subtitle="Review the terms below, then sign at the bottom.">
      {token === "demo" && <div className="mb-6 rounded-xl bg-brass/12 px-4 py-2.5 text-sm text-ink ring-1 ring-brass/25">Demo signing flow — real links are unique per contract.</div>}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-ink/8 bg-parchment p-6 md:p-8">
          <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><FileSignature size={20} className="text-brass" /> Venue Rental Agreement</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
            <p>This agreement is between {business.name} (&quot;Venue&quot;) and the undersigned (&quot;Client&quot;) for the exclusive use of the property and grounds for the Client&apos;s event.</p>
            <p><b>Inclusions.</b> 44 hours of exclusive access, the barn and orchard grounds, on-site farmhouse lodging for up to 25 guests, tables and chairs, and a day-of coordinator.</p>
            <p><b>Payment.</b> A non-refundable deposit reserves your date; the balance is due per your installment schedule, payable by card, Apple/Google Pay, or bank transfer (ACH).</p>
            <p><b>Cancellation.</b> Deposits are non-refundable. Balances paid are refundable up to 90 days before the event, less the deposit.</p>
            <p><b>Conduct &amp; liability.</b> The Client is responsible for guests&apos; conduct and for any damage beyond ordinary wear. Vendors must carry their own insurance.</p>
            <p className="text-stone">Full terms provided with your signed copy.</p>
          </div>
        </article>

        <div className="rounded-2xl border border-ink/8 bg-parchment p-6">
          <SignaturePad token={token} />
        </div>
      </div>
    </PortalShell>
  );
}
