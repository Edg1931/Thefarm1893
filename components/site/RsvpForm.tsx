"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

/**
 * Guest RSVP that flows into the CRM. Every guest is captured (a warm future
 * audience), and the subtle "planning your own?" opt-in tags them as a
 * future-couple lead for a gentle down-the-road nurture — the guest→couple loop.
 */
export function RsvpForm({ coupleName }: { coupleName: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const futureCouple = fd.get("futureCouple") === "on";
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") || "Guest"),
          email: String(fd.get("email") || ""),
          guestCount: Number(fd.get("attending")) || 1,
          eventType: futureCouple ? "Future Wedding" : "Wedding Guest",
          segment: futureCouple ? "future-couple" : "guest",
          source: futureCouple ? "guest-future-couple" : "wedding-guest",
          message: `RSVP for ${coupleName}'s wedding · ${fd.get("response")}`,
        }),
      });
    } catch { /* non-blocking in demo */ }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-white/10 p-8 text-center ring-1 ring-white/15">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brass/20"><Check className="text-brass-soft" size={28} /></div>
        <h3 className="mt-4 font-display text-3xl">Thank you! 💛</h3>
        <p className="mt-2 text-sm text-parchment/75">Your RSVP is in — {coupleName} can&apos;t wait to celebrate with you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-3 text-left">
      <input name="name" required placeholder="Your name" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-parchment outline-none placeholder:text-parchment/40 focus:border-brass" />
      <input name="email" type="email" required placeholder="Your email" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-parchment outline-none placeholder:text-parchment/40 focus:border-brass" />
      <div className="grid grid-cols-2 gap-3">
        <input name="attending" type="number" min={1} placeholder="# attending" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-parchment outline-none placeholder:text-parchment/40 focus:border-brass" />
        <select name="response" className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-parchment outline-none focus:border-brass">
          <option className="text-ink">Joyfully accepts</option>
          <option className="text-ink">Regretfully declines</option>
        </select>
      </div>
      <label className="flex items-start gap-2.5 rounded-xl bg-white/5 p-3 text-sm text-parchment/80">
        <input type="checkbox" name="futureCouple" className="mt-0.5" />
        <span>💍 We&apos;re dreaming of our own someday — keep us in mind for a tour of the farm.</span>
      </label>
      <button type="submit" disabled={status === "loading"} className="btn bg-parchment text-ink w-full disabled:opacity-60">
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Send RSVP
      </button>
    </form>
  );
}
