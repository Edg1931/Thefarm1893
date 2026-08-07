import Image from "next/image";
import { Reveal } from "@/components/site/Reveal";
import type { PhotoGroup } from "@/lib/images";
import type { Space } from "@/lib/content";

/**
 * The venue tour, built from what's actually in Storage.
 *
 * The old page showed four fixed "spaces" against hardcoded stock photos, so
 * the pictures never matched the property and the section read as filler.
 * Here each subfolder of `venue/` becomes an area — venue/outside,
 * venue/barn, venue/bridal-suite — titled from the folder name and
 * illustrated with its own photos. Reorganising the tour is a drag-and-drop
 * in Supabase, not a code change.
 *
 * Where a folder name matches one of the written spaces, that copy and
 * capacity come along, so words and pictures finally describe the same place.
 */

/** A natural walking order, so the tour reads outside → ceremony → inside → stay. */
const ORDER = [
  "outside", "exterior", "grounds", "orchard", "lawn", "ceremony",
  "porch", "cocktail", "inside", "interior", "barn", "reception",
  "bridal", "getting-ready", "prep", "farmhouse", "suite",
];
const rank = (key: string) => {
  const k = key.toLowerCase();
  const i = ORDER.findIndex((o) => k.includes(o));
  return i === -1 ? ORDER.length : i;
};

function matchSpace(group: PhotoGroup, spaces: Space[]): Space | undefined {
  const k = group.key.toLowerCase().replace(/[-_\s]/g, "");
  if (!k) return undefined;
  return spaces.find((s) => {
    const slug = s.slug.toLowerCase().replace(/^the/, "").replace(/[-_\s]/g, "");
    const name = s.name.toLowerCase().replace(/^the /, "").replace(/[-_\s]/g, "");
    return slug === k || name === k || k.includes(slug) || slug.includes(k);
  });
}

export function VenueAreas({ groups, spaces }: { groups: PhotoGroup[]; spaces: Space[] }) {
  const ordered = [...groups].sort((a, b) => rank(a.key) - rank(b.key) || a.label.localeCompare(b.label));

  return (
    <section className="bg-bone py-20 md:py-28">
      <div className="container-x space-y-20 md:space-y-28">
        {ordered.map((g, i) => {
          const sp = matchSpace(g, spaces);
          const [lead, ...rest] = g.photos;
          const flip = i % 2 === 1;

          return (
            <Reveal key={g.key || g.label}>
              <div className="grid items-center gap-10 lg:grid-cols-12">
                {/* Lead photo — the one that sells the space */}
                <div className={`lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
                    <Image src={lead} alt={sp?.name ?? g.label} fill className="object-cover" sizes="(max-width:1024px) 100vw, 58vw" />
                  </div>
                </div>

                <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
                  {(sp?.tag || sp?.capacity) && (
                    <p className="eyebrow">{[sp?.tag, sp?.capacity].filter(Boolean).join(" · ")}</p>
                  )}
                  <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">{sp?.name ?? g.label}</h2>
                  {sp?.detail && <p className="mt-5 text-lg leading-relaxed text-ink-soft">{sp.detail}</p>}
                  {sp?.blurb && <p className="mt-3 italic text-stone">{sp.blurb}</p>}
                  {!sp && (
                    <p className="mt-5 text-lg leading-relaxed text-ink-soft">
                      {g.photos.length} photo{g.photos.length === 1 ? "" : "s"} of {g.label.toLowerCase()} at The Farm.
                    </p>
                  )}

                  {/* Supporting shots — the rest of the folder */}
                  {rest.length > 0 && (
                    <div className="mt-6 grid grid-cols-3 gap-2">
                      {rest.slice(0, 6).map((p, j) => (
                        <div key={j} className="relative aspect-square overflow-hidden rounded-lg">
                          <Image src={p} alt="" fill className="object-cover transition-transform duration-700 hover:scale-105" sizes="18vw" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
