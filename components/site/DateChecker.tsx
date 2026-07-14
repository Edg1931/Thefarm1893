"use client";

import { useState } from "react";
import { CalendarCheck, CalendarX, Loader2, ArrowRight, Sun, Tag, BellRing, Check } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

type Quote = { price: number; base: number; tier: string; label: string; reason: string; savings?: number };
type GoldenHour = { sunset: string; goldenStart: string; ceremonyStart: string; note: string };
type Result = {
  available: boolean;
  alternatives: string[];
  message: string;
  quote?: Quote | null;
  goldenHour?: GoldenHour | null;
};

export function DateChecker({ compact = false }: { compact?: boolean }) {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [waitEmail, setWaitEmail] = useState("");
  const [waitlisted, setWaitlisted] = useState(false);

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

  async function joinWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!waitEmail) return;
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Waitlist", email: waitEmail, eventDate: date, source: "date-waitlist", message: `Waitlist for ${date}` }),
      });
    } catch { /* non-blocking */ }
    setWaitlisted(true);
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

              {(result.quote || result.goldenHour) && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {result.quote && (
                    <div className="rounded-lg bg-white/70 p-4">
                      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-brass">
                        <Tag size={13} /> {result.quote.label}
                      </p>
                      <p className="mt-1 font-display text-3xl text-ink">
                        {formatCurrency(result.quote.price)}
                        <span className="ml-1 align-middle text-xs text-stone">est. weekend</span>
                      </p>
                      {result.quote.savings ? (
                        <p className="text-xs font-medium text-sage-deep">Save {formatCurrency(result.quote.savings)} vs. peak</p>
                      ) : null}
                      <p className="mt-1 text-xs text-stone">{result.quote.reason}</p>
                    </div>
                  )}
                  {result.goldenHour && (
                    <div className="rounded-lg bg-white/70 p-4">
                      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-brass">
                        <Sun size={13} /> Golden-hour plan
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">
                        Sunset <span className="font-medium text-ink">{result.goldenHour.sunset}</span> · suggested ceremony{" "}
                        <span className="font-medium text-ink">{result.goldenHour.ceremonyStart}</span>
                      </p>
                      <p className="mt-1 text-xs text-stone">Say “I do” in soft light, portraits in golden hour.</p>
                    </div>
                  )}
                </div>
              )}

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
                        setWaitlisted(false);
                      }}
                      className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm transition hover:border-sage hover:bg-sage/10"
                    >
                      {formatDate(alt)}
                    </button>
                  ))}
                </div>
              )}

              {/* Waitlist — capture the lead even on a taken date */}
              <div className="mt-4 border-t border-terracotta/20 pt-4">
                {waitlisted ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-sage-deep"><Check size={16} /> You&apos;re on the list — we&apos;ll email you the moment {formatDate(date)} opens up.</p>
                ) : (
                  <form onSubmit={joinWaitlist} className="flex flex-col gap-2 sm:flex-row">
                    <input
                      type="email"
                      required
                      value={waitEmail}
                      onChange={(e) => setWaitEmail(e.target.value)}
                      placeholder="Email me if this date opens"
                      className="flex-1 rounded-full border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-sage"
                    />
                    <button type="submit" className="btn btn-ghost !py-2.5 !text-xs"><BellRing size={14} /> Join Waitlist</button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
