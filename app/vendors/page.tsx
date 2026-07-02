import Image from "next/image";
import Link from "next/link";
import {
  Star, MapPin, BadgeCheck, ArrowRight, Handshake,
  Camera, UtensilsCrossed, Flower2, Music, ClipboardList, Sparkles, Cake, Armchair,
  type LucideIcon,
} from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { VendorMatchmaker } from "@/components/site/VendorMatchmaker";
import { vendorCategories, vendors } from "@/lib/content";

export const metadata = { title: "Preferred Vendors" };

const icons: Record<string, LucideIcon> = {
  Camera, UtensilsCrossed, Flower2, Music, ClipboardList, Sparkles, Cake, Armchair,
};

const tierBadge: Record<string, { label: string; cls: string }> = {
  preferred: { label: "Preferred Partner", cls: "bg-brass text-ink" },
  featured: { label: "Featured", cls: "bg-sage-deep text-parchment" },
  listed: { label: "Trusted", cls: "bg-white/90 text-ink" },
};

export default function VendorsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="The Dream Team"
        script="your whole team, vetted"
        title="Preferred Vendors"
        subtitle="A curated circle of trusted local pros who know the farm by heart — so planning feels effortless."
        image="https://images.unsplash.com/photo-1522413452208-996ff3f3e740?auto=format&fit=crop&w=2100&q=80"
      />

      {/* Categories */}
      <section className="bg-bone py-20 md:py-24">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Everything you need, in one place</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Browse by category</h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {vendorCategories.map((c, i) => {
              const Icon = icons[c.icon] ?? Sparkles;
              return (
                <Reveal key={c.slug} delay={(i % 4) * 70}>
                  <div className="card-hover h-full rounded-2xl bg-parchment p-6 text-center shadow-[var(--shadow-soft)]">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage/12 text-sage-deep"><Icon size={24} /></div>
                    <p className="mt-4 font-display text-xl text-ink">{c.name}</p>
                    <p className="mt-1 text-xs text-stone">{c.blurb}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Matchmaker */}
      <section className="bg-[color:var(--color-linen)] py-20 md:py-28">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="eyebrow">Innovation</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">The industry's first venue AI vendor matchmaker</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Most venues hand you a PDF list. We built something no one else has: describe your
              vibe and budget, and our AI assembles a complete vendor team — every one already
              proven here at the farm — with a personal note on why they fit. One tap to request them all.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink-soft">
              <li className="flex gap-2"><BadgeCheck size={17} className="text-sage" /> Only vendors who've worked weddings at The Farm 1893</li>
              <li className="flex gap-2"><BadgeCheck size={17} className="text-sage" /> Matched to your style, budget, and date</li>
              <li className="flex gap-2"><BadgeCheck size={17} className="text-sage" /> We make the introductions for you</li>
            </ul>
          </Reveal>
          <Reveal delay={120}><VendorMatchmaker /></Reveal>
        </div>
      </section>

      {/* Directory */}
      <section className="bg-bone py-20 md:py-28">
        <div className="container-x">
          <Reveal className="flex items-end justify-between">
            <div>
              <p className="eyebrow">The roster</p>
              <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Our trusted partners</h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((v, i) => {
              const badge = tierBadge[v.tier];
              return (
                <Reveal key={v.id} delay={(i % 3) * 80}>
                  <article className="card-hover group h-full overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)]">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image src={v.image} alt={v.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 33vw" />
                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-wider ${badge.cls}`}>{badge.label}</span>
                      <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[0.62rem] font-medium text-white backdrop-blur">{v.priceBand}</span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-2xl text-ink">{v.name}</h3>
                        <span className="flex items-center gap-1 text-sm text-ink-soft"><Star size={14} className="fill-brass text-brass" /> {v.rating.toFixed(1)}</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.tagline}</p>
                      <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-4 text-xs text-stone">
                        <span className="flex items-center gap-1"><MapPin size={13} /> {v.location}</span>
                        <span className="font-medium text-sage-deep">{v.bookedWithUs} weddings here</span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vendor CTA — the two-sided flywheel */}
      <section className="bg-[color:var(--color-ink)] py-20 text-parchment md:py-24">
        <div className="container-x grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <Handshake className="text-brass-soft" />
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Are you a wedding pro?</h2>
            <p className="mt-4 max-w-lg text-parchment/75">
              Join our preferred vendor circle and get in front of every couple who books the
              farm. We send you qualified leads; you help us deliver unforgettable weddings.
              It's the local wedding economy, working together.
            </p>
          </Reveal>
          <Reveal delay={120} className="rounded-2xl bg-white/5 p-7 ring-1 ring-white/10">
            <p className="font-display text-2xl">Become a partner</p>
            <ul className="mt-4 space-y-2 text-sm text-parchment/75">
              <li className="flex gap-2"><ArrowRight size={16} className="text-brass-soft" /> Featured placement to booked couples</li>
              <li className="flex gap-2"><ArrowRight size={16} className="text-brass-soft" /> AI matchmaker recommendations</li>
              <li className="flex gap-2"><ArrowRight size={16} className="text-brass-soft" /> Priority for open-date referrals</li>
            </ul>
            <Link href="/contact" className="btn bg-parchment text-ink mt-6 w-full">Apply to Join</Link>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
