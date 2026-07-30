"use client";

import { useState } from "react";
import { Star, Send, Check } from "lucide-react";
import { Panel, StatCard } from "@/components/crm/widgets";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/lib/crm/comms";

const sourceLabel: Record<string, string> = { google: "Google", airbnb: "Airbnb", vrbo: "VRBO", facebook: "Facebook", "the-knot": "The Knot" };

export function ReviewBoard({ reviews, summary }: { reviews: Review[]; summary: { avg: number; count: number } }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function request(form: FormData) {
    setBusy(true);
    try {
      await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "request", to: form.get("email"), name: form.get("name") }) });
      setSent(true);
    } finally { setBusy(false); }
  }

  const bySource = reviews.reduce<Record<string, number>>((a, r) => ({ ...a, [r.source]: (a[r.source] ?? 0) + 1 }), {});

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Average rating" value={`${summary.avg} ★`} icon={Star} accent="brass" />
        <StatCard label="Total reviews" value={String(summary.count)} icon={Star} accent="sage" />
        <StatCard label="Sources" value={String(Object.keys(bySource).length)} icon={Star} accent="ink" />
      </div>

      <Panel title="Request a review">
        {sent ? (
          <p className="flex items-center gap-2 text-sm text-sage-deep"><Check size={16} /> Review request sent — thank-you note on its way.</p>
        ) : (
          <form action={request} className="flex flex-wrap gap-3">
            <input name="name" placeholder="Guest name" className="flex-1 rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <input name="email" type="email" required placeholder="Email" className="flex-1 rounded-xl border border-ink/12 bg-bone px-3 py-2.5 text-sm outline-none focus:border-brass" />
            <button type="submit" disabled={busy} className="btn btn-primary !py-2.5 !text-xs disabled:opacity-60"><Send size={14} /> {busy ? "Sending…" : "Send request"}</button>
          </form>
        )}
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-2xl border border-ink/8 bg-parchment p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-bone px-2.5 py-0.5 text-xs font-medium text-ink-soft">{sourceLabel[r.source] ?? r.source}</span>
              <span className="flex text-brass">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">“{r.body}”</p>
            <p className="mt-3 text-xs text-stone">{r.author} · {formatDate(r.date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
