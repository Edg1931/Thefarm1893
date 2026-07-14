import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { VirtualTour } from "@/components/site/VirtualTour";
import { spaces, amenities } from "@/lib/content";

export const metadata = { title: "The Venue" };

export default function VenuePage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="The Venue"
        script="every corner tells a story"
        title="A restored orchard, made for gathering"
        subtitle="Explore the four spaces that carry your celebration from first look to last dance."
        image="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2100&q=80"
      />

      <section className="bg-bone py-20 md:py-28">
        <div className="container-x space-y-24">
          {spaces.map((sp, i) => (
            <Reveal key={sp.slug}>
              <div className={`grid items-center gap-12 lg:grid-cols-2 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
                  <Image src={sp.image} alt={sp.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
                </div>
                <div>
                  <p className="eyebrow">{sp.tag} · {sp.capacity}</p>
                  <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">{sp.name}</h2>
                  <p className="mt-5 text-lg leading-relaxed text-ink-soft">{sp.detail}</p>
                  <p className="mt-3 italic text-stone">{sp.blurb}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <VirtualTour />

      <section className="bg-[color:var(--color-linen)] py-20 md:py-28">
        <div className="container-x">
          <Reveal className="text-center">
            <p className="eyebrow">Everything included</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Amenities &amp; comforts</h2>
          </Reveal>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
            {amenities.map((a, i) => (
              <Reveal key={a} delay={(i % 3) * 60}>
                <div className="flex items-start gap-3 border-b border-ink/10 pb-4 text-ink-soft">
                  <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {a}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-14 text-center">
            <Link href="/contact" className="btn btn-primary">Book a Private Tour <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
