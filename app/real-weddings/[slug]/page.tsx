import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { getRealWedding, realWeddings } from "@/lib/real-weddings";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return realWeddings.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getRealWedding(slug);
  return w
    ? { title: `${w.couple}'s Wedding`, description: w.quote, openGraph: { images: [w.hero] } }
    : { title: "Real Wedding" };
}

export default async function RealWeddingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = getRealWedding(slug);
  if (!w) notFound();

  return (
    <SiteShell>
      <div className="relative flex min-h-[64vh] items-end overflow-hidden pt-24">
        <Image src={w.hero} alt={`${w.couple}'s wedding`} fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40" />
        <div className="container-x relative z-10 pb-12 text-parchment">
          <p className="font-script text-4xl text-brass-soft">{w.season.toLowerCase()} at the farm</p>
          <h1 className="mt-1 font-display text-5xl md:text-7xl">{w.couple}</h1>
          <p className="mt-3 text-sm uppercase tracking-widest text-parchment/70">{formatDate(w.date)} · {w.palette} · {w.guests} guests</p>
        </div>
      </div>

      <section className="bg-bone py-16 md:py-24">
        <div className="container-x max-w-2xl">
          <Link href="/real-weddings" className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink"><ArrowLeft size={15} /> All real weddings</Link>
          <Quote className="mt-8 text-brass" size={34} />
          <p className="mt-3 font-display text-3xl italic leading-snug text-ink">“{w.quote}”</p>
          <div className="mt-8 space-y-5">
            {w.story.map((p, i) => <p key={i} className="text-lg leading-relaxed text-ink-soft">{p}</p>)}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-linen)] py-14">
        <div className="container-x grid grid-cols-2 gap-3 md:grid-cols-4">
          {w.gallery.map((src, i) => (
            <Reveal key={i} delay={(i % 4) * 70}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <Image src={src} alt={`${w.couple} gallery ${i + 1}`} fill className="object-cover transition-transform duration-700 hover:scale-105" sizes="(max-width:768px) 50vw, 25vw" />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-bone py-16">
        <div className="container-x max-w-2xl text-center">
          <p className="eyebrow">The dream team</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {w.team.map((t) => (
              <span key={t.role} className="rounded-full bg-parchment px-4 py-2 text-sm text-ink-soft shadow-[var(--shadow-soft)]">
                <span className="text-stone">{t.role}:</span> <span className="font-medium text-ink">{t.name}</span>
              </span>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/contact" className="btn btn-primary">Start Your Story <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
