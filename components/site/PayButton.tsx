"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

/**
 * Starts a checkout (Stripe when configured, demo success URL otherwise) and
 * redirects to the hosted payment page. Reused by the portal and pay flows.
 */
export function PayButton({ amount, description, email, kind = "balance", label, className }: {
  amount: number; description: string; email?: string; kind?: string; label?: string; className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function pay() {
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description, email, kind }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not start checkout.");
      window.location.href = data.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={pay} disabled={busy} className={className ?? "btn btn-primary disabled:opacity-60"}>
        <CreditCard size={16} /> {busy ? "Starting…" : label ?? "Make a payment"}
      </button>
      {err && <p className="mt-2 text-xs text-terracotta">{err}</p>}
    </div>
  );
}
