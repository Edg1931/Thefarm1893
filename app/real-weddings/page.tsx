import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { realWeddings } from "@/lib/real-weddings";
import { formatDate } from "@/lib/utils";

// Hero images come from Supabase Storage (heroes/<page>.jpg). Without this
// the hero is baked at build time, so a newly uploaded photo would never
// appear until the next deploy.
export const revalidate = 60;

export const metadata = {
  title: "Real Weddings",
  description: "Real celebrations at The Farm 1893 — see how couples brought their vision to life in the orchard.",
};

export default function RealWeddingsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Real Weddings"
        script="love, celebrated here"
        title="Real weddings at the farm"
        subtitle="Step inside real celebrations — the colors, the details, and the couples who made them unforgettable."
        heroKey="real-weddings"
        image="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2100&q=80"
      />
      <section className="bg-bone py-20 md:py-28">
        <div className="container-x space-y-10">
          {realWeddings.map((w, i) => (
            <Reveal key={w.slug}>
              <Link href={`/real-weddings/${w.slug}`} className="card-hover group grid overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)] lg:grid-cols-2">
                <div className={`relative aspect-[16/11] overflow-hidden lg:aspect-auto ${i % 2 ? "lg:order-2" : ""}`}>
                  <Image src={w.hero} alt={`${w.couple}'s wedding`} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 50vw" />
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <span className="eyebrow">{w.season} · {w.palette}</span>
                  <h2 className="mt-3 font-display text-4xl text-ink">{w.couple}</h2>
                  <p className="mt-1 text-sm text-stone">{formatDate(w.date)} · {w.guests} guests</p>
                  <div className="mt-4 flex text-brass">{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={15} className="fill-current" />)}</div>
                  <p className="mt-4 font-display text-xl italic text-ink-soft">“{w.quote}”</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brass">See their wedding <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
