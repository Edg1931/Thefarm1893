"use client";

import { useState } from "react";
import { Loader2, Heart, Check } from "lucide-react";

export function ReferForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.friendName || "Referred friend"),
          email: String(data.friendEmail || ""),
          source: "referral",
          message: `Referred by ${data.yourName} (${data.yourEmail}).`,
        }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage/10 p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage/20"><Check className="text-sage-deep" size={28} /></div>
        <h3 className="mt-4 font-display text-3xl text-ink">Thank you! 💛</h3>
        <p className="mx-auto mt-2 max-w-sm text-ink-soft">We&apos;ll reach out to your friend, and if they book, your reward is on us. You&apos;re the best.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-parchment p-7 shadow-[var(--shadow-soft)] md:p-9">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="yourName" label="Your name*" required />
        <Field name="yourEmail" label="Your email*" type="email" required />
        <Field name="friendName" label="Your friend's name*" required />
        <Field name="friendEmail" label="Your friend's email*" type="email" required />
      </div>
      {status === "error" && (
        <p className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta">Something went wrong. Please try again in a moment.</p>
      )}
      <button type="submit" disabled={status === "loading"} className="btn btn-primary mt-6 w-full disabled:opacity-60">
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
        Send the Referral
      </button>
      <p className="mt-3 text-center text-xs text-stone">We&apos;ll only use these details to send one lovely introduction.</p>
    </form>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-stone">{label}</label>
      <input name={name} type={type} required={required} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage" />
    </div>
  );
}
