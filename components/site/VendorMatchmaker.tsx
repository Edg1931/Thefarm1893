"use client";

import Image from "next/image";
import { useState } from "react";
import { Sparkles, Loader2, Star, MapPin, Wand2 } from "lucide-react";
import { vendorCategories, type Vendor } from "@/lib/content";
import Link from "next/link";

const STYLES = ["Timeless & elegant", "Rustic & cozy", "Modern & minimal", "Boho & whimsical", "Moody & dramatic"];
const BUDGETS = [
  { key: "$", label: "Intimate" },
  { key: "$$", label: "Signature" },
  { key: "$$$", label: "Luxe" },
] as const;

export function VendorMatchmaker() {
  const [style, setStyle] = useState(STYLES[0]);
  const [budget, setBudget] = useState<"$" | "$$" | "$$$">("$$");
  const [cats, setCats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [picks, setPicks] = useState<Vendor[] | null>(null);
  const [rationale, setRationale] = useState("");

  function toggle(slug: string) {
    setCats((c) => (c.includes(slug) ? c.filter((x) => x !== slug) : [...c, slug]));
  }

  async function build() {
    setLoading(true);
    setPicks(null);
    setError(false);
    try {
      const res = await fetch("/api/vendor-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style, budget, categories: cats }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setPicks(data.picks ?? []);
      setRationale(data.rationale ?? "");
    } catch {
      // Previously this rejected unhandled and the UI just returned to idle
      // with no explanation.
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-parchment p-7 shadow-[var(--shadow-lift)] md:p-9">
      <div className="flex items-center gap-2 text-brass">
        <Wand2 size={18} />
        <span className="text-xs font-semibold uppercase tracking-widest">AI Dream-Team Builder</span>
      </div>
      <h3 className="mt-3 font-display text-3xl text-ink">Let's assemble your vendor team</h3>
      <p className="mt-1 text-sm text-stone">Tell us your vibe — our AI curates a team that's already proven at the farm.</p>

      {/* Style */}
      <p className="mt-6 text-xs font-medium uppercase tracking-wider text-stone">Your vibe</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {STYLES.map((s) => (
          <button key={s} onClick={() => setStyle(s)}
            className={`rounded-full px-4 py-2 text-sm transition ${style === s ? "bg-ink text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Budget */}
      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-stone">Budget feel</p>
      <div className="mt-2 flex gap-2">
        {BUDGETS.map((b) => (
          <button key={b.key} onClick={() => setBudget(b.key)}
            className={`flex-1 rounded-xl px-4 py-3 text-center transition ${budget === b.key ? "bg-sage-deep text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>
            <span className="block font-display text-xl">{b.key}</span>
            <span className="text-xs">{b.label}</span>
          </button>
        ))}
      </div>

      {/* Categories */}
      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-stone">What do you need? <span className="normal-case text-stone/70">(leave blank for a full team)</span></p>
      <div className="mt-2 flex flex-wrap gap-2">
        {vendorCategories.map((c) => (
          <button key={c.slug} onClick={() => toggle(c.slug)}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${cats.includes(c.slug) ? "border-brass bg-brass/12 text-ink" : "border-ink/15 bg-white text-stone hover:border-ink/40"}`}>
            {c.name}
          </button>
        ))}
      </div>

      <button onClick={build} disabled={loading} className="btn btn-primary mt-7 w-full disabled:opacity-60">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
        Build My Dream Team
      </button>

      {error && (
        <p className="mt-3 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta ring-1 ring-terracotta/25">
          We couldn&apos;t build your team just now — please try again, or <Link href="/contact" className="font-medium underline">tell us what you&apos;re looking for</Link> and we&apos;ll match you personally.
        </p>
      )}

      {picks && (
        <div className="animate-rise mt-7">
          {rationale && (
            <div className="rounded-xl border border-sage/30 bg-sage/8 p-4 text-sm leading-relaxed text-ink-soft">
              <Sparkles size={15} className="mr-1 inline text-sage-deep" />
              {rationale}
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {picks.map((v) => (
              <div key={v.id} className="flex gap-3 rounded-xl bg-bone p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image src={v.image} alt={v.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{v.name}</p>
                  <p className="flex items-center gap-1 text-xs text-stone"><Star size={11} className="fill-brass text-brass" /> {v.rating.toFixed(1)} · {v.priceBand}</p>
                  <p className="flex items-center gap-1 text-xs text-stone"><MapPin size={11} /> {v.location}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/contact" className="btn btn-ghost mt-4 w-full !py-2.5 !text-xs">Request This Team →</Link>
        </div>
      )}
    </div>
  );
}
