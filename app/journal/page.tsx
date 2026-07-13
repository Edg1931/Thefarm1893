import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { posts } from "@/lib/journal";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "The Journal",
  description: "Wedding planning inspiration, color palettes, and guides from The Farm 1893.",
};

export default function JournalPage() {
  const [featured, ...rest] = posts;
  return (
    <SiteShell>
      <PageHero
        eyebrow="The Journal"
        script="stories & inspiration"
        title="Planning notes from the farm"
        subtitle="Real advice, color inspiration, and guides to help you plan a wedding you'll never want to end."
        image="https://images.unsplash.com/photo-1470259078422-826894b933ad?auto=format&fit=crop&w=2100&q=80"
      />

      <section className="bg-bone py-20 md:py-28">
        <div className="container-x">
          {/* Featured */}
          <Reveal>
            <Link href={`/journal/${featured.slug}`} className="card-hover group grid overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)] lg:grid-cols-2">
              <div className="relative aspect-[16/11] overflow-hidden lg:aspect-auto">
                <Image src={featured.cover} alt={featured.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 50vw" />
              </div>
              <div className="flex flex-col justify-center p-8 md:p-12">
                <span className="eyebrow">{featured.category} · {featured.readMins} min read</span>
                <h2 className="mt-4 font-display text-4xl leading-tight text-ink">{featured.title}</h2>
                <p className="mt-4 text-ink-soft">{featured.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-brass">Read the story <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
              </div>
            </Link>
          </Reveal>

          {/* Grid */}
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 90}>
                <Link href={`/journal/${p.slug}`} className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={p.cover} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:1024px) 100vw, 33vw" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone"><span className="text-brass">{p.category}</span> · <Clock size={12} /> {p.readMins} min</span>
                    <h3 className="mt-3 font-display text-2xl text-ink">{p.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-ink-soft">{p.excerpt}</p>
                    <span className="mt-4 text-xs text-stone">{formatDate(p.date)}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
