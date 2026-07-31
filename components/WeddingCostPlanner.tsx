"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Link2, Check, Sparkles, PartyPopper, Home, Wallet, Gift, Warehouse } from "lucide-react";
import { type CostItem, type Room, type CoveredBy, summarize } from "@/lib/crm/lodging";
import { formatCurrency } from "@/lib/utils";

const MODES: { key: CoveredBy; label: string; short: string }[] = [
  { key: "couple", label: "We'll cover it", short: "We pay" },
  { key: "guest", label: "Assign to a guest", short: "Guest pays" },
  { key: "registry", label: "Put on registry", short: "Registry gift" },
];

export function WeddingCostPlanner({
  items,
  rooms: initialRooms,
  coupleName,
}: {
  items: CostItem[];
  rooms: Room[];
  coupleName: string;
}) {
  const storeKey = `farm1893:plan:${coupleName}`;
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [copied, setCopied] = useState<string | null>(null);

  // Restore saved assignments (demo persistence).
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(window.localStorage.getItem(storeKey) || "null");
      if (saved) setRooms((rs) => rs.map((r) => (saved[r.id] ? { ...r, ...saved[r.id] } : r)));
    } catch { /* ignore */ }
  }, [storeKey]);

  function persist(next: Room[]) {
    if (typeof window === "undefined") return;
    const map = Object.fromEntries(next.map((r) => [r.id, { coveredBy: r.coveredBy, guestName: r.guestName ?? "", paid: r.paid }]));
    try { window.localStorage.setItem(storeKey, JSON.stringify(map)); } catch { /* ignore */ }
  }

  function setMode(id: string, mode: CoveredBy) {
    setRooms((rs) => {
      const next = rs.map((r) => r.id === id
        ? { ...r, coveredBy: mode, paid: mode === "couple" ? false : r.paid, guestName: mode === "guest" ? r.guestName : undefined }
        : r);
      persist(next);
      return next;
    });
  }
  function setGuestName(id: string, name: string) {
    setRooms((rs) => { const next = rs.map((r) => (r.id === id ? { ...r, guestName: name } : r)); persist(next); return next; });
  }
  function copyLink(room: Room) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/pay?item=${encodeURIComponent(room.name)}&amount=${Math.round(room.price)}&kind=room`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(room.id);
    setTimeout(() => setCopied(null), 1600);
  }

  const totals = useMemo(() => summarize(items, rooms), [items, rooms]);
  const savePct = totals.fullTotal ? Math.round(((totals.delegated + totals.onRegistry) / totals.fullTotal) * 100) : 0;

  const farmhouse = rooms.filter((r) => r.type !== "silo");
  const silos = rooms.filter((r) => r.type === "silo");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left: line items + lodging */}
      <div className="space-y-6">
        <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
          <h3 className="flex items-center gap-2 font-display text-2xl text-ink"><PartyPopper size={20} className="text-brass" /> Your celebration</h3>
          <ul className="mt-4 divide-y divide-ink/8">
            {items.map((i) => (
              <li key={i.label} className="flex items-center justify-between py-3">
                <div><p className="font-medium text-ink">{i.label}</p><p className="text-xs text-stone">{i.detail}</p></div>
                <span className="font-medium text-ink">{formatCurrency(i.amount)}</span>
              </li>
            ))}
          </ul>
        </div>

        <LodgingGroup title="Farmhouse rooms" icon={Home} rooms={farmhouse}
          setMode={setMode} setGuestName={setGuestName} copyLink={copyLink} copied={copied} />

        <LodgingGroup title="The Silos" icon={Warehouse} rooms={silos}
          note="Assign each silo to a guest couple, cover it yourself, or add it to your registry as a gift."
          setMode={setMode} setGuestName={setGuestName} copyLink={copyLink} copied={copied} />
      </div>

      {/* Right: live summary */}
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
            <Row label="Lodging (all rooms & silos)" value={formatCurrency(totals.lodgingTotal)} muted />
            <div className="my-2 h-px bg-white/10" />
            <Row label="Assigned to guests" value={`– ${formatCurrency(totals.delegated)}`} accent="sage" />
            <Row label="On your registry" value={`– ${formatCurrency(totals.onRegistry)}`} accent="brass" />
            <Row label="Already paid by guests" value={formatCurrency(totals.guestPaid)} accent="brass" />
            <div className="my-2 h-px bg-white/10" />
            <div className="flex items-center justify-between"><span className="font-medium">Your total</span><span className="font-display text-2xl">{formatCurrency(totals.coupleTotal)}</span></div>
          </div>
          {(totals.delegated + totals.onRegistry) > 0 && (
            <div className="mx-6 mb-6 rounded-xl bg-sage/15 p-4 text-center ring-1 ring-sage/30">
              <Sparkles className="mx-auto text-brass-soft" size={18} />
              <p className="mt-1 font-display text-2xl text-parchment">You're saving {formatCurrency(totals.delegated + totals.onRegistry)}</p>
              <p className="text-xs text-parchment/60">{savePct}% of your wedding covered by guests &amp; gifts</p>
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-stone">Assignments save automatically. Registry silos appear on your guest registry to be gift-funded.</p>
      </div>
    </div>
  );
}

function LodgingGroup({ title, icon: Icon, rooms, note, setMode, setGuestName, copyLink, copied }: {
  title: string; icon: typeof Home; rooms: Room[]; note?: string;
  setMode: (id: string, m: CoveredBy) => void; setGuestName: (id: string, n: string) => void;
  copyLink: (room: Room) => void; copied: string | null;
}) {
  if (!rooms.length) return null;
  return (
    <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
      <h3 className="flex items-center gap-2 font-display text-2xl text-ink"><Icon size={20} className="text-brass" /> {title}</h3>
      {note && <p className="mt-1 text-sm text-stone">{note}</p>}
      <div className="mt-4 space-y-3">
        {rooms.map((r) => {
          const guest = r.coveredBy === "guest";
          const registry = r.coveredBy === "registry";
          return (
            <div key={r.id} className={`rounded-xl border p-4 transition ${guest ? "border-sage/40 bg-sage/8" : registry ? "border-brass/40 bg-brass/8" : "border-ink/10 bg-bone"}`}>
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

              {/* 3-way assignment */}
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {MODES.map((m) => (
                  <button key={m.key} onClick={() => setMode(r.id, m.key)}
                    className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${r.coveredBy === m.key
                      ? m.key === "registry" ? "bg-brass text-ink" : m.key === "guest" ? "bg-sage-deep text-parchment" : "bg-ink text-parchment"
                      : "bg-white text-ink-soft ring-1 ring-ink/10 hover:bg-linen"}`}>
                    {m.short}
                  </button>
                ))}
              </div>

              {guest && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input value={r.guestName ?? ""} onChange={(e) => setGuestName(r.id, e.target.value)} placeholder="Which guest couple?"
                    className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs outline-none focus:border-sage" />
                  {r.paid ? (
                    <span className="flex items-center gap-1 rounded-full bg-sage/15 px-3 py-1.5 text-xs font-medium text-sage-deep"><Check size={12} /> Paid</span>
                  ) : (
                    <button onClick={() => copyLink(r)} className="flex items-center gap-1 rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink-soft hover:border-ink/40">
                      {copied === r.id ? <><Check size={12} className="text-sage" /> Copied!</> : <><Link2 size={12} /> Copy pay link</>}
                    </button>
                  )}
                </div>
              )}
              {registry && (
                <p className="mt-3 flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-xs text-brass"><Gift size={12} /> On your registry — guests can gift-fund this stay.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Row({ label, value, muted, accent }: { label: string; value: string; muted?: boolean; accent?: "sage" | "brass" }) {
  const color = accent === "sage" ? "text-sage" : accent === "brass" ? "text-brass-soft" : muted ? "text-parchment/60" : "text-parchment";
  return <div className="flex items-center justify-between"><span className="text-parchment/60">{label}</span><span className={color}>{value}</span></div>;
}
