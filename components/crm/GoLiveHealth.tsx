"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Loader2, RefreshCw, Database } from "lucide-react";
import { Panel } from "@/components/crm/widgets";

type Check = { key: string; ok: boolean; label: string; detail: string };

/**
 * Live database health, read from /api/health. Shows what is actually true in
 * the database (not just which env vars are set), so the client can watch the
 * system come online as they add keys and run the seed.
 */
export function GoLiveHealth() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(true);

  async function load() {
    setBusy(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setChecks(data.checks ?? []);
      setConnected(Boolean(data.connected));
    } catch {
      setChecks([{ key: "error", ok: false, label: "Health check", detail: "Couldn't reach the health endpoint." }]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <Panel
      title={<span className="flex items-center gap-2"><Database size={16} className="text-brass" /> Database health</span>}
      action={
        <button onClick={load} disabled={busy} className="flex items-center gap-1.5 text-sm text-brass hover:underline disabled:opacity-50">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Re-check
        </button>
      }
    >
      <div className={`mb-4 rounded-xl px-4 py-2.5 text-sm ring-1 ${connected ? "bg-sage/10 text-sage-deep ring-sage/25" : "bg-brass/10 text-ink ring-brass/25"}`}>
        {connected
          ? "Live — the CRM is reading and writing your real database."
          : "Demo mode — everything works with sample data. Add the Supabase keys in Vercel to go live."}
      </div>

      {busy && !checks && <p className="py-6 text-center text-sm text-stone">Checking…</p>}

      <ul className="space-y-2">
        {(checks ?? []).map((c) => (
          <li key={c.key} className="flex items-start gap-3 rounded-xl bg-bone p-3">
            <span className="mt-0.5 shrink-0">
              {c.ok ? <CheckCircle2 size={17} className="text-sage-deep" /> : <AlertCircle size={17} className="text-brass" />}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{c.label}</p>
              <p className="text-xs text-stone">{c.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
