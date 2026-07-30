"use client";

import { useState } from "react";
import { Ticket, Plus } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { formatDate } from "@/lib/utils";
import { couponValid, type Coupon } from "@/lib/crm/comms";
import { newId } from "@/lib/crm/store";

export function CouponManager({ initial }: { initial: Coupon[] }) {
  const [coupons, setCoupons] = useState<Coupon[]>(initial);
  const [adding, setAdding] = useState(false);

  function add(form: FormData) {
    const c: Coupon = {
      id: newId("CP"), code: String(form.get("code") || "SAVE").toUpperCase(),
      kind: (String(form.get("kind") || "percent") as Coupon["kind"]), amount: Number(form.get("amount")) || 0,
      expiresAt: String(form.get("expiresAt") || "2026-12-31"), uses: 0, maxUses: Number(form.get("maxUses")) || 0, active: true,
    };
    setCoupons((all) => [c, ...all]);
    setAdding(false);
    fetch("/api/coupons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c.code, kind: c.kind, amount: c.amount, expiresAt: c.expiresAt, maxUses: c.maxUses }) }).catch(() => {});
  }

  return (
    <Panel title={<span className="flex items-center gap-2"><Ticket size={16} className="text-brass" /> Coupons & promo codes</span>}
      action={<button onClick={() => setAdding((v) => !v)} className="text-sm font-medium text-brass hover:underline"><Plus size={13} className="inline" /> New</button>}>
      {adding && (
        <form action={add} className="mb-4 grid gap-2 rounded-xl bg-bone p-3 sm:grid-cols-5">
          <input name="code" placeholder="CODE" className="rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm uppercase outline-none focus:border-brass" />
          <select name="kind" className="rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm outline-none focus:border-brass"><option value="percent">% off</option><option value="amount">$ off</option></select>
          <input name="amount" type="number" placeholder="Amount" className="rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm outline-none focus:border-brass" />
          <input name="expiresAt" type="date" className="rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm outline-none focus:border-brass" />
          <button type="submit" className="btn btn-primary !py-2 !text-xs">Create</button>
        </form>
      )}
      <ul className="space-y-2">
        {coupons.map((c) => {
          const ok = couponValid(c);
          return (
            <li key={c.id} className="flex items-center justify-between rounded-xl bg-bone p-3">
              <div>
                <p className="font-mono text-sm font-semibold text-ink">{c.code}</p>
                <p className="text-xs text-stone">{c.kind === "percent" ? `${c.amount}% off` : `$${c.amount} off`} · exp {formatDate(c.expiresAt)} · {c.uses}{c.maxUses ? `/${c.maxUses}` : ""} used</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ok ? "bg-sage/15 text-sage-deep" : "bg-ink/8 text-stone"}`}>{ok ? "Active" : "Inactive"}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
