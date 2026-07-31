"use client";

import { useState } from "react";
import { Wand2, Loader2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PALETTES } from "@/lib/services/design";

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];
const STYLES = ["Timeless", "Rustic", "Modern", "Boho", "Moody"];

type Result = {
  vision: string;
  paletteName: string;
  palette: { hex: string; label: string }[];
  moodboard: string[];
  signatureDetails: string[];
  aiGenerated?: boolean;
};

export function DesignStudio() {
  const [season, setSeason] = useState("Fall");
  const [style, setStyle] = useState("Rustic");
  const [palette, setPalette] = useState("blush-sage");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const [err, setErr] = useState(false);

  async function generate() {
    setLoading(true);
    setResult(null);
    setErr(false);
    try {
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season, style, palette }),
      });
      const d = await res.json();
      if (res.ok && Array.isArray(d?.moodboard)) setResult(d);
      else setErr(true); // don't crash on an error payload with no moodboard
    } catch {
      setErr(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* Controls */}
      <div className="rounded-2xl bg-parchment p-7 shadow-[var(--shadow-soft)] lg:sticky lg:top-28 lg:self-start">
        <div className="flex items-center gap-2 text-brass">
          <Wand2 size={18} /><span className="text-xs font-semibold uppercase tracking-widest">AI Design Studio</span>
        </div>
        <h3 className="mt-3 font-display text-2xl text-ink">Craft your vision</h3>

        <p className="mt-6 text-xs font-medium uppercase tracking-wider text-stone">Season</p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {SEASONS.map((s) => (
            <button key={s} onClick={() => setSeason(s)}
              className={`rounded-lg py-2 text-xs transition ${season === s ? "bg-ink text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>{s}</button>
          ))}
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-stone">Style</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button key={s} onClick={() => setStyle(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition ${style === s ? "bg-sage-deep text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>{s}</button>
          ))}
        </div>

        <p className="mt-5 text-xs font-medium uppercase tracking-wider text-stone">Color palette</p>
        <div className="mt-2 space-y-2">
          {Object.entries(PALETTES).map(([key, p]) => (
            <button key={key} onClick={() => setPalette(key)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 transition ${palette === key ? "border-brass bg-brass/8" : "border-ink/10 hover:border-ink/30"}`}>
              <span className="flex">
                {p.colors.map((c) => <span key={c.hex} className="h-6 w-6 rounded-full ring-1 ring-black/5 -ml-1.5 first:ml-0" style={{ background: c.hex }} />)}
              </span>
              <span className="text-sm text-ink">{p.name}</span>
            </button>
          ))}
        </div>

        <button onClick={generate} disabled={loading} className="btn btn-primary mt-6 w-full disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Visualize My Day
        </button>
      </div>

      {/* Result */}
      <div className="min-h-[420px]">
        {!result && !loading && (
          <div className="grid h-full place-items-center rounded-2xl border border-dashed border-ink/20 bg-parchment/40 p-10 text-center">
            <div>
              <Wand2 className="mx-auto text-brass" size={36} />
              <p className="mt-4 font-display text-2xl text-ink">Your dream day, previewed</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-stone">Pick a season, style, and palette — our AI designer will craft a mood board and a vision written just for you at the farm.</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="grid h-full place-items-center rounded-2xl bg-parchment/40 p-10">
            <div className="text-center">
              <Loader2 className="mx-auto animate-spin text-brass" size={34} />
              <p className="mt-4 font-script text-2xl text-brass">Designing your day…</p>
            </div>
          </div>
        )}

        {err && (
          <p className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta">Couldn&apos;t generate your board just now — please try again.</p>
        )}

        {result && (
          <div className="animate-rise space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-widest text-brass">Your mood board · {result.paletteName}</p>
              <span className="rounded-full bg-ink/5 px-3 py-1 text-[0.65rem] font-medium text-ink-soft">
                {result.aiGenerated ? "✨ AI-generated in your palette" : "Styled in your palette"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {result.moodboard.map((src, i) => (
                <div key={i} className={`group relative overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-square"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Wedding mood board" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  {/* Palette wash — makes every board read in the chosen colors */}
                  <span
                    className="pointer-events-none absolute inset-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-40"
                    style={{ background: `linear-gradient(140deg, ${result.palette[0].hex}dd 0%, ${result.palette[2].hex}55 45%, ${result.palette[3].hex}cc 100%)`, opacity: 0.62 }}
                  />
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{ background: `radial-gradient(circle at 30% 20%, ${result.palette[1].hex}44, transparent 60%)`, mixBlendMode: "soft-light" }}
                  />
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-2xl text-ink">{result.paletteName}</p>
                <div className="flex gap-2">
                  {result.palette.map((c) => (
                    <div key={c.hex} className="text-center">
                      <span className="block h-8 w-8 rounded-full ring-1 ring-black/5" style={{ background: c.hex }} />
                      <span className="mt-1 block text-[0.6rem] text-stone">{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 leading-relaxed text-ink-soft">{result.vision}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {result.signatureDetails.map((d) => (
                  <span key={d} className="rounded-full bg-sage/12 px-3 py-1 text-xs text-sage-deep">{d}</span>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact" className="btn btn-primary flex-1">Book a Tour to See It <ArrowRight size={16} /></Link>
                <Link href="/vendors" className="btn btn-ghost flex-1">Build My Vendor Team</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
