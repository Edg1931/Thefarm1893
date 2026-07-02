"use client";

import { useMemo, useState } from "react";
import { Users, Link2, Check, Sparkles, PartyPopper, Home, Wallet } from "lucide-react";
import { type CostItem, type Room, summarize } from "@/lib/crm/lodging";
import { formatCurrency } from "@/lib/utils";

export function WeddingCostPlanner({
  items,
  rooms: initialRooms,
  coupleName,
}: {
  items: CostItem[];
  rooms: Room[];
  coupleName: string;
}) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [copied, setCopied] = useState<string | null>(null);

  const totals = useMemo(() => summarize(items, rooms), [items, rooms]);

  function toggle(id: string) {
    setRooms((rs) => rs.map((r) => {
      if (r.id !== id) return r;
      const coveredBy = r.coveredBy === "couple" ? "guest" : "couple";
      return { ...r, coveredBy, paid: coveredBy === "couple" ? false : r.paid, guestName: coveredBy === "couple" ? undefined : r.guestName };
    }));
  }
  function setGuestName(id: string, name: string) {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, guestName: name } : r)));
  }
  function copyLink(id: string) {
    const url = `https://thefarm1893.vercel.app/pay/room/${id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  }

  const savePct = totals.fullTotal ? Math.round((totals.delegated / totals.fullTotal) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left: line items + rooms */}
      <div className="space-y-6">
        {/* Core costs */}
        <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
          <h3 className="flex items-center gap-2 font-display text-2xl text-ink"><PartyPopper size={20} className="text-brass" /> Your celebration</h3>
          <ul className="mt-4 divide-y divide-ink/8">
            {items.map((i) => (
              <li key={i.label} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{i.label}</p>
                  <p className="text-xs text-stone">{i.detail}</p>
                </div>
                <span className="font-medium text-ink">{formatCurrency(i.amount)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lodging split */}
        <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-2xl text-ink"><Home size={20} className="text-brass" /> Overnight lodging</h3>
            <span className="rounded-full bg-sage/12 px-3 py-1 text-xs font-medium text-sage-deep">Tap a room to delegate & save</span>
          </div>
          <p className="mt-2 text-sm text-stone">
            Hand any room to a guest and they'll pay their own stay — it comes right off your total.
          </p>

          <div className="mt-4 space-y-3">
            {rooms.map((r) => {
              const guest = r.coveredBy === "guest";
              return (
                <div key={r.id} className={`rounded-xl border p-4 transition ${guest ? "border-sage/40 bg-sage/8" : "border-ink/10 bg-bone"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-ink">{r.name}</p>
                        <span className="flex items-center gap-1 text-xs text-stone"><Users size={11} /> {r.sleeps}</span>
                      </div>
                      <p className="text-xs text-stone">{r.description}</p>
                    </div>
                    <span className="shrink-0 font-medium text-ink">{formatCurrency(r.price)}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggle(r.id)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${guest ? "bg-sage-deep text-parchment" : "bg-ink text-parchment"}`}
                    >
                      {guest ? "✓ Guest is covering this" : "We'll cover this"}
                    </button>
                    {guest && (
                      <>
                        <input
                          value={r.guestName ?? ""}
                          onChange={(e) => setGuestName(r.id, e.target.value)}
                          placeholder="Who's covering it?"
                          className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-sage"
                        />
                        {r.paid ? (
                          <span className="flex items-center gap-1 rounded-full bg-sage/15 px-3 py-1.5 text-xs font-medium text-sage-deep"><Check size={12} /> Paid</span>
                        ) : (
                          <button onClick={() => copyLink(r.id)} className="flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink-soft hover:border-ink/40">
                            {copied === r.id ? <><Check size={12} className="text-sage" /> Copied!</> : <><Link2 size={12} /> Copy pay link</>}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: live summary (sticky) */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl bg-[color:var(--color-ink)] text-parchment shadow-[var(--shadow-lift)]">
          <div className="bg-gradient-to-br from-sage-deep/60 to-brass/20 px-6 py-5">
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-parchment/70"><Wallet size={14} /> Live wedding cost</p>
            <p className="mt-2 font-display text-5xl">{formatCurrency(totals.coupleTotal)}</p>
            <p className="text-sm text-parchment/60">your out-of-pocket total</p>
          </div>
          <div className="space-y-3 px-6 py-5 text-sm">
            <Row label="Full wedding cost" value={formatCurrency(totals.fullTotal)} muted />
            <Row label="Celebration & catering" value={formatCurrency(totals.base)} muted />
            <Row label="Lodging (all rooms)" value={formatCurrency(totals.lodgingTotal)} muted />
            <div className="my-2 h-px bg-white/10" />
            <Row label="Delegated to guests" value={`– ${formatCurrency(totals.delegated)}`} accent="sage" />
            <Row label="Already paid by guests" value={formatCurrency(totals.guestPaid)} accent="brass" />
            <div className="my-2 h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="font-medium">Your total</span>
              <span className="font-display text-2xl">{formatCurrency(totals.coupleTotal)}</span>
            </div>
          </div>

          {totals.delegated > 0 && (
            <div className="mx-6 mb-6 rounded-xl bg-sage/15 p-4 text-center ring-1 ring-sage/30">
              <Sparkles className="mx-auto text-brass-soft" size={18} />
              <p className="mt-1 font-display text-2xl text-parchment">You're saving {formatCurrency(totals.delegated)}</p>
              <p className="text-xs text-parchment/60">{savePct}% of your wedding covered by loved ones</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-stone">
          Guests pay securely per room. {coupleName}, share a room's link and it updates here automatically.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: "sage" | "brass" }) {
  const color = accent === "sage" ? "text-sage" : accent === "brass" ? "text-brass-soft" : muted ? "text-parchment/60" : "text-parchment";
  return (
    <div className="flex items-center justify-between">
      <span className="text-parchment/60">{label}</span>
      <span className={color}>{value}</span>
    </div>
  );
}
