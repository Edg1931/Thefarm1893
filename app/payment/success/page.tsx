import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { business } from "@/lib/content";

export const metadata = { title: "Payment received" };

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; demo?: string }>;
}) {
  const { kind, demo } = await searchParams;
  const label =
    kind === "silo" ? "Your silo stay is booked" :
    kind === "deposit" ? "Your deposit is in" :
    kind === "balance" ? "Your balance is paid" :
    "Payment received";

  return (
    <SiteShell>
      <section className="grid min-h-[70vh] place-items-center px-6 py-24 text-center">
        <div className="max-w-md">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage/15">
            <Check className="text-sage-deep" size={34} />
          </div>
          <h1 className="mt-6 font-display text-4xl text-ink md:text-5xl">{label} 🌾</h1>
          <p className="mt-3 text-ink-soft">
            Thank you! A confirmation is on its way to your inbox. We can&apos;t wait to host you at {business.name}.
          </p>
          {demo === "1" && (
            <p className="mt-4 rounded-xl bg-brass/8 px-4 py-2.5 text-xs text-ink-soft">
              Demo mode — no card was charged. Connect Stripe to take real payments.
            </p>
          )}
          <Link href="/" className="btn btn-primary mt-8">Back home <ArrowRight size={16} /></Link>
        </div>
      </section>
    </SiteShell>
  );
}
