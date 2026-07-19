import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Users, BedDouble, Bath, Check, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { SiloBooking } from "@/components/site/SiloBooking";
import { VenueCrossLink } from "@/components/site/CrossPromo";
import { getSilo, silos } from "@/lib/silos";
import { listPhotos } from "@/lib/images";

export function generateStaticParams() {
  return silos.map((s) => ({ slug: s.slug }));
}

export const revalidate = 3600; // refresh silo photos from Storage hourly

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSilo(slug);
  return s
    ? { title: `${s.name} — Silo Stays`, description: s.tagline, openGraph: { images: [s.hero] } }
    : { title: "Silo Stay" };
}

export default async function SiloPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getSilo(slug);
  if (!s) notFound();

  // Real photos from Storage (silos/<slug>/), else the stock set — all-or-nothing so it never mixes.
  const uploaded = await listPhotos(`silos/${slug}`);
  const hero = uploaded[0] ?? s.hero;
  const gallery = uploaded.length ? uploaded.slice(1) : s.gallery;

  return (
    <SiteShell>
      {/* Gallery hero */}
      <section className="pt-24">
        <div className="container-x">
          <Link href="/silos" className="mb-4 inline-flex items-center gap-2 text-sm text-stone hover:text-ink"><ArrowLeft size={15} /> All silos</Link>
          <div className="grid gap-2 overflow-hidden rounded-2xl md:grid-cols-4 md:grid-rows-2">
            <div className="relative aspect-[16/10] md:col-span-2 md:row-span-2 md:aspect-auto">
              <Image src={hero} alt={s.name} fill priority className="object-cover" sizes="(max-width:768px) 100vw, 50vw" />
            </div>
            {gallery.slice(0, 4).map((g, i) => (
              <div key={i} className="relative hidden aspect-[4/3] md:block">
                <Image src={g} alt={`${s.name} ${i + 1}`} fill className="object-cover" sizes="25vw" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-bone py-12 md:py-16">
        <div className="container-x grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-4xl text-ink md:text-5xl">{s.name}</h1>
              <span className="flex items-center gap-1.5 text-ink-soft"><Star size={16} className="fill-brass text-brass" /> {s.rating} · {s.reviews} reviews</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-5 text-sm text-ink-soft">
              <span className="flex items-center gap-1.5"><Users size={15} /> Sleeps {s.sleeps}</span>
              <span className="flex items-center gap-1.5"><BedDouble size={15} /> {s.beds} bedroom{s.beds > 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1.5"><Bath size={15} /> {s.baths} bath</span>
              {s.petFriendly && <span className="rounded-full bg-sage/12 px-2.5 py-0.5 text-xs text-sage-deep">Pet-friendly</span>}
            </div>

            <div className="mt-8 space-y-4 border-t border-ink/10 pt-8">
              {s.description.map((p, i) => <p key={i} className="text-lg leading-relaxed text-ink-soft">{p}</p>)}
            </div>

            <div className="mt-8 border-t border-ink/10 pt-8">
              <h2 className="font-display text-2xl text-ink">What this silo offers</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {s.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2.5 text-ink-soft"><Check size={17} className="text-sage" /> {a}</div>
                ))}
              </div>
            </div>

            <div className="mt-8 border-t border-ink/10 pt-8">
              <h2 className="font-display text-2xl text-ink">Good to know</h2>
              <ul className="mt-4 space-y-2">
                {s.houseRules.map((r) => <li key={r} className="flex items-center gap-2.5 text-sm text-ink-soft"><ShieldCheck size={16} className="text-stone" /> {r}</li>)}
              </ul>
            </div>
          </div>

          {/* Booking (sticky) */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal><SiloBooking silo={s} /></Reveal>
          </div>
        </div>
      </section>

      <VenueCrossLink />
    </SiteShell>
  );
}
