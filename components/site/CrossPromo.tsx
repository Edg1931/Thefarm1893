import Image from "next/image";
import Link from "next/link";
import { BedDouble, ArrowRight, Sparkles } from "lucide-react";
import { silos } from "@/lib/silos";
import { formatCurrency } from "@/lib/utils";

/**
 * WEDDING → SILOS. Subtle cross-promo for guests on a wedding page: the silos as
 * individually-bookable weekend stays. Cross-markets the rentals without shouting.
 */
export function SiloCrossPromo({ heading = "Prefer a place of your own?" }: { heading?: string }) {
  return (
    <section className="bg-[color:var(--color-linen)] py-16 md:py-20">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <BedDouble className="mx-auto text-brass" size={22} />
          <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">{heading}</h2>
          <p className="mt-2 text-ink-soft">Beyond the farmhouse, four restored silos sleep 2–6 — book one for the wedding weekend and make it a proper getaway.</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {silos.map((s) => (
            <Link key={s.slug} href={`/silos/${s.slug}`} className="card-hover group overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={s.hero} alt={s.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
              </div>
              <div className="p-4">
                <p className="font-display text-lg text-ink">{s.name}</p>
                <p className="mt-0.5 text-xs text-stone">Sleeps {s.sleeps} · {formatCurrency(s.nightly)}/night</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * SILOS → VENUE. Subtle cross-promo on a rental page: the farm also hosts
 * weddings & events. One quiet line + a link, never overpowering.
 */
export function VenueCrossLink() {
  return (
    <section className="bg-parchment py-12">
      <div className="container-x">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-ink/10 bg-bone p-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <Sparkles className="shrink-0 text-brass" size={20} />
            <p className="text-ink-soft"><span className="font-medium text-ink">Dreaming a little bigger?</span> The Farm 1893 is also an all-inclusive wedding &amp; gathering venue.</p>
          </div>
          <Link href="/weddings" className="btn btn-ghost shrink-0 !py-2.5 !text-xs">Explore the venue <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}
