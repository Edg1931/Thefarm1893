import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { DateChecker } from "@/components/site/DateChecker";
import { ScarcityBadge } from "@/components/site/ScarcityBadge";
import { packages, faqs } from "@/lib/content";

export const metadata = { title: "Investment" };

export default function PricingPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="The Investment"
        script="beautifully all-inclusive"
        title="Transparent packages, no surprises"
        subtitle="Every package includes the whole property. Pick the celebration that fits your story."
        heroKey="pricing"
        image="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=2100&q=80"
      />

      <section className="bg-bone py-20 md:py-28">
        <div className="container-x grid gap-6 lg:grid-cols-3">
          {packages.map((p) => (
            <Reveal key={p.name}>
              <div className={`flex h-full flex-col rounded-2xl p-8 ${p.featured ? "bg-[color:var(--color-ink)] text-parchment shadow-[var(--shadow-lift)] ring-2 ring-brass" : "bg-parchment shadow-[var(--shadow-soft)]"}`}>
                {p.featured && <span className="mb-4 inline-block w-fit rounded-full bg-brass px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-widest text-ink">Most popular</span>}
                <h3 className="font-display text-3xl">{p.name}</h3>
                <p className={`mt-1 text-sm ${p.featured ? "text-parchment/60" : "text-stone"}`}>{p.summary}</p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-5xl">{p.price}</span>
                  <span className={`text-xs ${p.featured ? "text-parchment/60" : "text-stone"}`}>{p.cadence}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm"><Check size={16} className={`mt-0.5 shrink-0 ${p.featured ? "text-brass-soft" : "text-sage"}`} /> {f}</li>
                  ))}
                </ul>
                <Link href="/contact" className={`btn mt-7 ${p.featured ? "bg-parchment text-ink" : "btn-ghost"}`}>Inquire Now</Link>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="container-x mt-8 text-center text-sm text-stone">
          Pricing shown is a starting-point estimate. Peak Saturdays, add-ons, and guest counts affect the final quote — request a personalized proposal.
        </p>
      </section>

      <section className="bg-[color:var(--color-linen)] py-20 md:py-28">
        <div className="container-x grid items-start gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Good to know</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Frequently asked</h2>
            <div className="mt-8 space-y-5">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-xl border border-ink/10 bg-parchment p-5">
                  <summary className="cursor-pointer list-none font-display text-xl text-ink marker:hidden">
                    <span className="flex items-center justify-between">
                      {f.q}
                      <span className="text-brass transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
          <Reveal delay={150} className="lg:sticky lg:top-28">
            <div className="mb-4"><ScarcityBadge /></div>
            <DateChecker />
            <Link href="/contact" className="btn btn-primary mt-4 w-full">Request a Proposal <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
