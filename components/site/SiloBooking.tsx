"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Check, Lock, Tag, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Silo } from "@/lib/silos";

const DIRECT_DISCOUNT = 0.1; // book-direct-and-save vs. the OTAs

export function SiloBooking({ silo }: { silo: Silo }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000))
    : 0;
  const roomTotal = nights * silo.nightly;
  const discount = Math.round(roomTotal * DIRECT_DISCOUNT);
  const total = nights > 0 ? roomTotal - discount + silo.cleaningFee : 0;
  const validNights = nights >= silo.minNights;

  async function reserve(e: React.FormEvent) {
    e.preventDefault();
    if (!validNights || !name || !email) return;
    setStatus("loading");
    try {
      // Tags the guest as VRBO (not Wedding) in the CRM pipeline.
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email,
          eventType: "Silo Stay",
          source: "vrbo-silos",
          eventDate: checkIn,
          guestCount: guests,
          message: `Silo Stays booking · ${silo.name} · ${nights} nights from ${checkIn} · ${formatCurrency(total)}`,
        }),
      });
      // Pluggable: swap for Stripe/Helcim checkout when configured.
    } catch { /* non-blocking in demo */ }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl border border-sage/40 bg-sage/10 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage/20"><Check className="text-sage-deep" size={28} /></div>
        <h3 className="mt-4 font-display text-2xl text-ink">You&apos;re booked in! 🌾</h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-ink-soft">A confirmation for <b>{silo.name}</b> is on its way to {email}. We can&apos;t wait to host you.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-lift)]">
      <div className="flex items-baseline justify-between">
        <p><span className="font-display text-3xl text-ink">{formatCurrency(silo.nightly)}</span> <span className="text-sm text-stone">/ night</span></p>
        <span className="flex items-center gap-1 text-sm text-ink-soft"><Star size={14} className="fill-brass text-brass" /> {silo.rating} · {silo.reviews}</span>
      </div>

      <form onSubmit={reserve} className="mt-5 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-stone">Check-in
            <input type="date" required min={new Date().toISOString().slice(0, 10)} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="rounded-lg border border-ink/15 bg-bone px-3 py-2.5 text-sm text-ink outline-none focus:border-sage" />
          </label>
          <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-stone">Check-out
            <input type="date" required min={checkIn || new Date().toISOString().slice(0, 10)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="rounded-lg border border-ink/15 bg-bone px-3 py-2.5 text-sm text-ink outline-none focus:border-sage" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-stone">Guests
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="rounded-lg border border-ink/15 bg-bone px-3 py-2.5 text-sm text-ink outline-none focus:border-sage">
            {Array.from({ length: silo.sleeps }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>)}
          </select>
        </label>

        {nights > 0 && !validNights && (
          <p className="rounded-lg bg-terracotta/10 px-3 py-2 text-xs text-terracotta">Minimum stay is {silo.minNights} nights.</p>
        )}

        {validNights && (
          <div className="space-y-1.5 rounded-xl bg-bone p-4 text-sm">
            <Row label={`${formatCurrency(silo.nightly)} × ${nights} nights`} value={formatCurrency(roomTotal)} />
            <Row label="Book-direct discount" value={`– ${formatCurrency(discount)}`} accent />
            <Row label="Cleaning fee" value={formatCurrency(silo.cleaningFee)} />
            <div className="mt-1 flex justify-between border-t border-ink/10 pt-2 font-medium text-ink">
              <span>Total</span><span className="font-display text-lg">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-lg border border-ink/15 bg-bone px-3 py-2.5 text-sm outline-none focus:border-sage" />
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg border border-ink/15 bg-bone px-3 py-2.5 text-sm outline-none focus:border-sage" />
        </div>

        <button type="submit" disabled={status === "loading" || !validNights} className="btn btn-primary w-full disabled:opacity-50">
          {status === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
          Reserve &amp; Pay
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-stone"><Tag size={12} /> Book direct and save {Math.round(DIRECT_DISCOUNT * 100)}% vs. Airbnb &amp; Vrbo</p>
      </form>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-stone">{label}</span>
      <span className={accent ? "text-sage-deep" : "text-ink-soft"}>{value}</span>
    </div>
  );
}
