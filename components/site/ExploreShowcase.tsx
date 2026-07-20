import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";

export type ShowcaseBlock = {
  label: string;
  blurb: string;
  href: string;
  photos: string[]; // [0] = feature, next few = strip
};

/**
 * "Explore the Farm" — three areas (Venue, Bridal Prep, Silos), each with a
 * feature photo, a small strip, and a link. Photos come from Storage folders.
 */
export function ExploreShowcase({ blocks }: { blocks: ShowcaseBlock[] }) {
  return (
    <section className="bg-bone py-24 md:py-32">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Explore the farm</p>
          <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">Every part of your weekend</h2>
          <p className="mt-4 text-ink-soft">From the getting-ready suites to the ceremony and the silos you&apos;ll sleep in — take a look around.</p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {blocks.map((b, i) => (
            <Reveal key={b.label} delay={(i % 3) * 110}>
              <Link href={b.href} className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)]">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={b.photos[0]} alt={b.label} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 33vw" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-parchment backdrop-blur">{b.label}</span>
                </div>
                {b.photos.length > 1 && (
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {b.photos.slice(1, 4).map((p, j) => (
                      <div key={j} className="relative aspect-square overflow-hidden rounded-sm">
                        <Image src={p} alt="" fill className="object-cover" sizes="15vw" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl text-ink">{b.label}</h3>
                  <p className="mt-1 flex-1 text-sm text-ink-soft">{b.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brass">Take a look <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
