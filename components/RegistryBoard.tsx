"use client";

import { useState } from "react";
import {
  BedDouble, Wine, Camera, Pizza, Sparkles, Plane, Home, Heart, Gift,
  Check, Loader2, Lock, type LucideIcon,
} from "lucide-react";
import { type Fund, summarizeRegistry } from "@/lib/crm/registry";
import { formatCurrency } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = { BedDouble, Wine, Camera, Pizza, Sparkles, Plane, Home, Heart };
const QUICK = [25, 50, 100, 250];

export function RegistryBoard({ funds: initial }: { funds: Fund[] }) {
  const [funds, setFunds] = useState<Fund[]>(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | "">("");
  const [paying, setPaying] = useState(false);
  const [thanks, setThanks] = useState<string | null>(null);

  const totals = summarizeRegistry(funds);

  async function give(id: string) {
    const amt = Number(amount);
    if (!amt || amt <= 0) return;
    setPaying(true);
    // Pluggable: swap for Stripe Checkout when STRIPE_SECRET_KEY is configured.
    await new Promise((r) => setTimeout(r, 900));
    setFunds((fs) => fs.map((f) => (f.id === id ? { ...f, contributed: f.contributed + amt } : f)));
    setPaying(false);
    setOpenId(null);
    setAmount("");
    setThanks(id);
    setTimeout(() => setThanks(null), 2600);
  }

  return (
    <div>
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Gifted so far" value={formatCurrency(totals.totalGifted)} />
        <Stat label="Funds fully gifted" value={String(totals.fullyFunded)} />
        <Stat label="Toward their costs" value={formatCurrency(totals.costOffset)} accent />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {funds.map((f) => {
          const Icon = ICONS[f.icon] ?? Gift;
          const pct = f.goal > 0 ? Math.min(100, Math.round((f.contributed / f.goal) * 100)) : null;
          const funded = f.goal > 0 && f.contributed >= f.goal;
          const open = openId === f.id;
          return (
            <div key={f.id} className="flex flex-col rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-sage/12 text-sage-deep"><Icon size={22} /></div>
                {f.coversCost && <span className="rounded-full bg-brass/15 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-wider text-brass">Lowers their cost</span>}
              </div>
              <h3 className="mt-4 font-display text-2xl text-ink">{f.title}</h3>
              <p className="mt-1 flex-1 text-sm text-ink-soft">{f.blurb}</p>

              {pct !== null ? (
                <div className="mt-4">
                  <div className="h-2 overflow-hidden rounded-full bg-linen">
                    <div className="h-full rounded-full bg-gradient-to-r from-sage-deep to-sage" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-xs text-stone">{formatCurrency(f.contributed)} of {formatCurrency(f.goal)} · {pct}%</p>
                </div>
              ) : (
                <p className="mt-4 text-xs text-stone">{formatCurrency(f.contributed)} gifted so far · give any amount</p>
              )}

              {thanks === f.id ? (
                <p className="mt-4 flex items-center gap-2 rounded-full bg-sage/15 px-4 py-2.5 text-sm font-medium text-sage-deep"><Check size={15} /> Thank you for your gift! 💛</p>
              ) : funded ? (
                <p className="mt-4 flex items-center gap-2 rounded-full bg-sage/12 px-4 py-2.5 text-sm text-sage-deep"><Check size={15} /> Fully gifted — thank you!</p>
              ) : open ? (
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    {QUICK.map((q) => (
                      <button key={q} onClick={() => setAmount(q)} className={`flex-1 rounded-lg py-2 text-xs transition ${amount === q ? "bg-ink text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>${q}</button>
                    ))}
                  </div>
                  <input type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")} placeholder="Other amount" className="w-full rounded-lg border border-ink/15 bg-bone px-3 py-2.5 text-sm outline-none focus:border-sage" />
                  <div className="flex gap-2">
                    <button onClick={() => give(f.id)} disabled={paying || !amount} className="btn btn-primary flex-1 !py-2.5 !text-xs disabled:opacity-50">
                      {paying ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Give {amount ? formatCurrency(Number(amount)) : ""}
                    </button>
                    <button onClick={() => setOpenId(null)} className="btn btn-ghost !py-2.5 !px-4 !text-xs">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setOpenId(f.id); setAmount(f.goal && f.goal < 250 ? f.goal : ""); }} className="btn btn-primary mt-4 w-full !py-2.5 !text-xs">
                  <Gift size={14} /> Contribute
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-sm text-stone flex items-center justify-center gap-1.5">
        <Lock size={13} /> Secure checkout · gifts go directly to the couple
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-parchment p-5 text-center shadow-[var(--shadow-soft)]">
      <p className={`font-display text-3xl ${accent ? "text-brass" : "text-ink"}`}>{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-stone">{label}</p>
    </div>
  );
}
