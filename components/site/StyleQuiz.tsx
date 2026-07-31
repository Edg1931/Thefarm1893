"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { quiz, scoreQuiz, type Choice } from "@/lib/quiz";
import { PALETTES } from "@/lib/services/design";

type DesignResult = {
  vision: string;
  paletteName: string;
  palette: { hex: string; label: string }[];
  moodboard: string[];
  signatureDetails: string[];
};

export function StyleQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [result, setResult] = useState<{ style: string; palette: string; season: string } | null>(null);
  const [design, setDesign] = useState<DesignResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState(false);

  const total = quiz.length;

  async function choose(choice: Choice) {
    const next = [...answers, choice];
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
      return;
    }
    // Finished — compute and fetch a real mood board.
    const scored = scoreQuiz(next);
    setResult(scored);
    setLoading(true);
    try {
      const res = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season: scored.season, style: scored.style, palette: scored.palette }),
      });
      const d = await res.json();
      setDesign(res.ok && Array.isArray(d?.moodboard) ? d : null); // guard against error payloads
    } catch {
      setDesign(null);
    } finally {
      setLoading(false);
    }
  }

  async function saveLead(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSaveErr(false);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Quiz result", email, source: "wedding-style-quiz", message: `Style: ${result?.style}, palette: ${result?.palette}, season: ${result?.season}` }),
      });
      if (!res.ok) throw new Error("bad status");
      setSaved(true);
    } catch {
      setSaveErr(true);
    }
  }

  function restart() {
    setStep(0); setAnswers([]); setResult(null); setDesign(null); setEmail(""); setSaved(false);
  }

  // ---- Result view ----
  if (result) {
    const paletteName = PALETTES[result.palette]?.name ?? result.palette;
    return (
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="eyebrow">Your result</p>
          <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">
            You&apos;re <span className="text-sage-deep">{result.style}</span> &amp; <span className="text-brass">{paletteName}</span>
          </h2>
          <p className="mt-2 text-ink-soft">A {result.season.toLowerCase()} celebration at the farm, dressed in your colors.</p>
        </div>

        {loading ? (
          <div className="mt-10 grid place-items-center py-16">
            <Loader2 className="animate-spin text-brass" size={34} />
            <p className="mt-3 font-script text-2xl text-brass">Designing your board…</p>
          </div>
        ) : design ? (
          <div className="animate-rise mt-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {design.moodboard.map((src, i) => (
                <div key={i} className={`relative overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Your wedding mood board" loading="lazy" decoding="async" className="h-full w-full object-cover" style={{ aspectRatio: i === 0 ? "1" : "1" }} />
                  <span className="pointer-events-none absolute inset-0 mix-blend-multiply" style={{ background: `linear-gradient(140deg, ${design.palette[0].hex}dd, ${design.palette[3].hex}bb)`, opacity: 0.6 }} />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
              <div className="flex gap-2">
                {design.palette.map((c) => <span key={c.hex} className="h-7 w-7 rounded-full ring-1 ring-black/5" style={{ background: c.hex }} />)}
              </div>
              <p className="mt-4 leading-relaxed text-ink-soft">{design.vision}</p>
            </div>
          </div>
        ) : null}

        {/* Lead capture */}
        <div className="mt-8 rounded-2xl bg-[color:var(--color-ink)] p-7 text-parchment md:p-9">
          {saved ? (
            <div className="text-center">
              <Sparkles className="mx-auto text-brass-soft" />
              <p className="mt-3 font-display text-2xl">Sent! Check your inbox 🌾</p>
              <p className="mt-1 text-sm text-parchment/70">We&apos;ll email your style board and a few open dates that match.</p>
              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/design-my-day" className="btn bg-parchment text-ink">Refine in Design Studio <ArrowRight size={16} /></Link>
                <Link href="/contact" className="btn btn-light">Book a Tour</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={saveLead} className="grid items-center gap-4 md:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="font-display text-2xl">Want your style board emailed to you?</p>
                <p className="mt-1 text-sm text-parchment/70">Plus open dates that match your season.</p>
              </div>
              <div className="flex flex-col gap-2">
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" aria-label="Email address" className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-parchment outline-none placeholder:text-parchment/40 focus:border-brass" />
                <button type="submit" className="btn bg-parchment text-ink">Email My Result</button>
                {saveErr && <p className="text-xs text-brass-soft">Couldn&apos;t send just now — please try again.</p>}
              </div>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <button onClick={restart} className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink"><RefreshCw size={14} /> Retake the quiz</button>
        </div>
      </div>
    );
  }

  // ---- Question view ----
  const question = quiz[step];
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="flex justify-between text-xs uppercase tracking-widest text-stone">
          <span>Question {step + 1} of {total}</span>
          <span>{Math.round(((step) / total) * 100)}% complete</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-linen">
          <div className="h-full rounded-full bg-gradient-to-r from-sage-deep to-brass transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
        </div>
      </div>

      <h2 className="text-center font-display text-3xl text-ink md:text-4xl">{question.q}</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {question.choices.map((c) => (
          <button
            key={c.label}
            onClick={() => choose(c)}
            className="card-hover rounded-2xl border border-ink/12 bg-parchment p-6 text-left text-lg text-ink transition hover:border-sage"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
