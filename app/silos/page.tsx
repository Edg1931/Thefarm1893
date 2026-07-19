import Image from "next/image";
import Link from "next/link";
import { Star, Users, BedDouble, Bath, ArrowRight, ShieldCheck, Tag, Headset, TreePine, Quote } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { VenueCrossLink } from "@/components/site/CrossPromo";
import { silos, siloReviews } from "@/lib/silos";
import { listPhotos, heroOr } from "@/lib/images";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Silo Stays — Vacation Rentals",
  description: "Stay in one of four restored grain silos at The Farm 1893 — cozy vacation rentals in the Ohio countryside. Book direct and save.",
};
export const revalidate = 60;

const perks = [
  { icon: Tag, title: "Book direct & save", body: "10% below Airbnb & Vrbo — no platform markup." },
  { icon: ShieldCheck, title: "No hidden fees", body: "Transparent pricing, secure checkout, instant confirmation." },
  { icon: TreePine, title: "The whole farm", body: "Orchard walks, fire pits, and 40 acres to roam." },
  { icon: Headset, title: "Real hosts", body: "We're on-site and here whenever you need us." },
];

export default async function SilosPage() {
  const [heroImage, siloHeroes] = await Promise.all([
    heroOr("hero", "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=2100&q=80"),
    Promise.all(silos.map(async (s) => [s.slug, (await listPhotos(`silos/${s.slug}`))[0] ?? s.hero] as const)),
  ]);
  const heroBySlug = Object.fromEntries(siloHeroes);
  return (
    <SiteShell>
      <PageHero
        eyebrow="Silo Stays · Vacation Rentals"
        script="stay a while"
        title="Sleep in a restored silo"
        subtitle="Four one-of-a-kind grain silos, reimagined as cozy countryside getaways — available to rent year-round, wedding or not."
        image={heroImage}
      />

      {/* Perks */}
      <section className="border-b border-ink/10 bg-parchment py-10">
        <div className="container-x grid grid-cols-2 gap-6 md:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage/12 text-sage-deep"><p.icon size={18} /></div>
              <div><p className="text-sm font-medium text-ink">{p.title}</p><p className="text-xs text-stone">{p.body}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Listings */}
      <section className="bg-bone py-20 md:py-24">
        <div className="container-x">
          <Reveal className="text-center">
            <p className="eyebrow">Choose your silo</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Four stays, each one unique</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {silos.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 2) * 100}>
                <Link href={`/silos/${s.slug}`} className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)]">
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <Image src={heroBySlug[s.slug]} alt={s.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 50vw" />
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink"><Star size={12} className="fill-brass text-brass" /> {s.rating}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl text-ink">{s.name}</h3>
                    <p className="mt-1 flex-1 text-sm text-ink-soft">{s.tagline}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-stone">
                      <span className="flex items-center gap-1"><Users size={13} /> {s.sleeps}</span>
                      <span className="flex items-center gap-1"><BedDouble size={13} /> {s.beds} bed{s.beds > 1 ? "s" : ""}</span>
                      <span className="flex items-center gap-1"><Bath size={13} /> {s.baths} bath</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-4">
                      <span><span className="font-display text-2xl text-ink">{formatCurrency(s.nightly)}</span><span className="text-xs text-stone"> / night</span></span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-brass">View &amp; book <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-[color:var(--color-sage-deep)] py-20 text-parchment md:py-24">
        <div className="container-x">
          <Reveal className="text-center"><Quote className="mx-auto text-brass-soft" /><p className="eyebrow mt-3 !text-brass-soft">Guest reviews</p><h2 className="mt-2 font-display text-4xl md:text-5xl">4.95 stars across the silos</h2></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {siloReviews.map((r) => (
              <Reveal key={r.name}>
                <figure className="flex h-full flex-col rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
                  <div className="flex text-brass-soft">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} className="fill-current" />)}</div>
                  <blockquote className="mt-3 flex-1 text-parchment/90">“{r.text}”</blockquote>
                  <figcaption className="mt-4 text-sm"><span className="font-medium text-brass-soft">{r.name}</span> <span className="text-parchment/50">· {r.stay}</span></figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <VenueCrossLink />
    </SiteShell>
  );
}
