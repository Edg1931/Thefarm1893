"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Heart } from "lucide-react";

const EVENT_TYPES = ["Wedding", "Corporate / Retreat", "Anniversary", "Shower", "Celebration of Life", "Other"];
const BUDGETS = ["Not sure yet", "Under $5,000", "$5,000–$10,000", "$10,000–$20,000", "$20,000–$30,000", "$30,000+"];
const HEARD_ABOUT = ["Instagram", "Google search", "The Knot / WeddingWire", "Pinterest", "Friend or family", "A wedding vendor", "TikTok", "Drove by", "Other"];
const STYLES = ["Not sure yet", "Timeless & elegant", "Rustic & cozy", "Modern & minimal", "Boho & whimsical", "Moody & dramatic"];

export function LeadForm({ defaultDate = "" }: { defaultDate?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [priority, setPriority] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, source: "website-contact" }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPriority(data?.score?.priority ?? null);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="animate-rise rounded-2xl border border-sage/40 bg-sage/10 p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage/20">
          <CheckCircle2 className="text-sage-deep" size={34} />
        </div>
        <h3 className="mt-5 font-display text-3xl text-ink">Your inquiry is in! 🌾</h3>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thank you — we can't wait to help you plan something unforgettable. Our team
          {priority === "hot" ? " will reach out within the hour" : " will be in touch within one business day"}.
          Keep an eye on your inbox for a welcome note and our full brochure.
        </p>
        <p className="mt-4 font-script text-2xl text-brass">With love, The Farm 1893</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name*" name="name" required placeholder="First & last" />
        <Field label="Email*" name="email" type="email" required placeholder="you@email.com" />
        <Field label="Phone" name="phone" type="tel" placeholder="(000) 000-0000" />
        <Field label="Event date" name="eventDate" type="date" defaultValue={defaultDate} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-stone">Event type</label>
          <select name="eventType" className="rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage">
            {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <Field label="Estimated guests" name="guestCount" type="number" placeholder="e.g. 150" />
        <SelectField label="Budget range" name="budget" options={BUDGETS} />
        <SelectField label="How did you hear about us?" name="heardAbout" options={HEARD_ABOUT} />
        <SelectField label="Your style / vibe" name="style" options={STYLES} />
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider text-stone">Your vision &amp; must-haves</label>
        <textarea
          name="message"
          rows={3}
          placeholder="Ceremony spot, overnight stays, food dreams, anything on your wish list…"
          className="rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage"
        />
      </div>
      <button type="submit" disabled={status === "loading"} className="btn btn-primary mt-6 w-full disabled:opacity-60">
        {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
        Send My Inquiry
      </button>
      {status === "error" && (
        <p className="mt-3 text-center text-sm text-terracotta">
          Something went wrong — please try again or call us directly.
        </p>
      )}
      <p className="mt-3 text-center text-xs text-stone">
        We reply fast. Your details are private and never shared.
      </p>
    </form>
  );
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-stone">{label}</label>
      <select name={name} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Field({
  label, name, type = "text", required, placeholder, defaultValue,
}: {
  label: string; name: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-stone">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none transition focus:border-sage"
      />
    </div>
  );
}
