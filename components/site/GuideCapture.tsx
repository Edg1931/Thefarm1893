"use client";

import { useState } from "react";
import { Download, Loader2, Check } from "lucide-react";

export function GuideCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Guide download", email, source: "pricing-guide-magnet", message: "Requested the pricing & planning guide." }),
      });
    } catch { /* non-blocking */ }
    setStatus("done");
  }

  return (
    <div className="rounded-2xl bg-parchment p-8 shadow-[var(--shadow-soft)] md:p-10">
      {status === "done" ? (
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage/15"><Check className="text-sage-deep" /></div>
          <div>
            <p className="font-display text-2xl text-ink">Check your inbox! 🌾</p>
            <p className="text-sm text-ink-soft">Your Pricing &amp; Planning Guide is on its way.</p>
          </div>
        </div>
      ) : (
        <div className="grid items-center gap-6 md:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eyebrow">Free download</p>
            <h3 className="mt-2 font-display text-3xl text-ink">The Pricing &amp; Planning Guide</h3>
            <p className="mt-2 text-ink-soft">Packages, real pricing, and everything you need to plan your weekend at the farm — sent straight to your inbox.</p>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="rounded-full border border-ink/15 bg-bone px-5 py-3.5 outline-none focus:border-sage"
            />
            <button type="submit" disabled={status === "loading"} className="btn btn-primary disabled:opacity-60">
              {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Send Me the Guide
            </button>
            <p className="text-center text-xs text-stone">No spam — just the good stuff.</p>
          </form>
        </div>
      )}
    </div>
  );
}
