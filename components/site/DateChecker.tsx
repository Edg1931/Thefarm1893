"use client";

import { useState } from "react";
import { CalendarCheck, CalendarX, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Result = {
  available: boolean;
  alternatives: string[];
  message: string;
};

export function DateChecker({ compact = false }: { compact?: boolean }) {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={compact ? "" : "rounded-2xl bg-white/90 p-7 shadow-[var(--shadow-soft)] backdrop-blur"}>
      {!compact && (
        <>
          <p className="eyebrow">Real-time availability</p>
          <h3 className="mt-2 font-display text-3xl text-ink">Is your date open?</h3>
          <p className="mt-1 text-sm text-stone">Check instantly — no waiting on an email.</p>
        </>
      )}
      <form onSubmit={check} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={new Date().toISOString().slice(0, 10)}
          className="flex-1 rounded-full border border-ink/15 bg-bone px-5 py-3.5 text-ink outline-none transition focus:border-sage"
          required
        />
        <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <CalendarCheck size={16} />}
          Check Date
        </button>
      </form>

      {result && (
        <div className="animate-rise mt-5">
          {result.available ? (
            <div className="rounded-xl border border-sage/40 bg-sage/10 p-5">
              <div className="flex items-center gap-3">
                <CalendarCheck className="text-sage-deep" />
                <p className="font-display text-2xl text-sage-deep">
                  {formatDate(date)} is available!
                </p>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{result.message}</p>
              <Link href={`/contact?date=${date}`} className="btn btn-primary mt-4 !py-2.5">
                Reserve a Tour <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-5">
              <div className="flex items-center gap-3">
                <CalendarX className="text-terracotta" />
                <p className="font-display text-2xl text-terracotta">That date is taken</p>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{result.message}</p>
              {result.alternatives?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.alternatives.map((alt) => (
                    <button
                      key={alt}
                      onClick={() => {
                        setDate(alt);
                        setResult(null);
                      }}
                      className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm transition hover:border-sage hover:bg-sage/10"
                    >
                      {formatDate(alt)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
