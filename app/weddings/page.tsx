import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, Star } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { DateChecker } from "@/components/site/DateChecker";
import { packages, testimonials, gallery } from "@/lib/content";

export const metadata = { title: "Weddings" };

const includes = [
  "Ceremony in the orchard, on the porch, or in the barn",
  "Cocktail hour & reception, seamlessly connected",
  "Bridal suite & groom's quarters for getting ready",
  "Farmhouse lodging for up to 25 of your people",
  "Dedicated venue coordinator, start to finish",
  "Tables, farm chairs, and setup included",
  "Bonfire pit, lawn games & orchard photo spots",
  "Ample on-site parking with easy access",
];

export default function WeddingsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Weddings"
        script="to have & to hold"
        title="A wedding weekend, not just a wedding day"
        subtitle="Marry beneath heritage apple trees, feast in a candlelit barn, and stay until the last goodbye Sunday morning."
        image="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2100&q=80"
      />

      <section className="bg-bone py-20 md:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">The all-in-one difference</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Everything in one beautiful place</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              No shuttling guests across town. No watching the clock. Just one gorgeous
              property where every moment — from the rehearsal toast to the farewell brunch —
              unfolds at your own pace.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {includes.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <Check size={17} className="mt-0.5 shrink-0 text-sage" /> {f}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150} className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
            <Image src={gallery[1]} alt="Orchard wedding ceremony" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          </Reveal>
        </div>
      </section>

      <section className="bg-[color:var(--color-sage-deep)] py-20 text-parchment md:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center text-brass-soft">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} className="fill-current" />)}</div>
            <blockquote className="mt-6 font-display text-3xl leading-snug md:text-4xl">
              “{testimonials[0].quote}”
            </blockquote>
            <p className="mt-6 font-script text-3xl text-brass-soft">{testimonials[0].name}</p>
            <p className="text-xs uppercase tracking-widest text-parchment/50">{testimonials[0].detail}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-bone py-20 md:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Wedding packages</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Simple, all-inclusive pricing</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {packages.map((p) => (
              <Reveal key={p.name}>
                <div className={`flex h-full flex-col rounded-2xl p-8 ${p.featured ? "bg-[color:var(--color-ink)] text-parchment ring-2 ring-brass" : "bg-parchment shadow-[var(--shadow-soft)]"}`}>
                  <h3 className="font-display text-3xl">{p.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="font-display text-4xl">{p.price}</span>
                    <span className={`text-xs ${p.featured ? "text-parchment/60" : "text-stone"}`}>{p.cadence}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm"><Check size={16} className={`mt-0.5 shrink-0 ${p.featured ? "text-brass-soft" : "text-sage"}`} /> {f}</li>
                    ))}
                  </ul>
                  <Link href="/contact" className={`btn mt-7 ${p.featured ? "bg-parchment text-ink" : "btn-ghost"}`}>Inquire</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-linen)] py-20 md:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Check availability</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Let's find your date</h2>
            <p className="mt-4 text-ink-soft">See if your dream date is open, then reserve a private tour.</p>
          </Reveal>
          <Reveal delay={150}><DateChecker /></Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
