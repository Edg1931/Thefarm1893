import Link from "next/link";
import { XCircle, ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";

export const metadata = { title: "Payment cancelled", robots: { index: false } };

export default function PaymentCancelledPage() {
  return (
    <SiteShell>
      <section className="grid min-h-[70vh] place-items-center px-6 py-24 text-center">
        <div className="max-w-md">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-ink/8">
            <XCircle className="text-stone" size={34} />
          </div>
          <h1 className="mt-6 font-display text-4xl text-ink md:text-5xl">No worries — nothing was charged</h1>
          <p className="mt-3 text-ink-soft">Your checkout was cancelled. Whenever you&apos;re ready, you can pick up right where you left off.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/silos" className="btn btn-primary"><ArrowLeft size={16} /> Back to silos</Link>
            <Link href="/contact" className="btn btn-ghost">Contact us</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
