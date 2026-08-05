"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, LifeBuoy } from "lucide-react";

/**
 * Dashboard error boundary. Without this, a thrown error in any dashboard
 * server component (a Supabase outage, an unexpected row shape) fell through to
 * Next's raw error screen — alarming, and it gave staff no way back.
 */
export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[dashboard] render error", error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-md rounded-2xl bg-parchment p-8 text-center shadow-[var(--shadow-soft)]">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-terracotta/12">
          <AlertTriangle size={22} className="text-terracotta" />
        </span>
        <h1 className="mt-4 font-display text-2xl text-ink">This screen hit a snag</h1>
        <p className="mt-2 text-sm text-stone">
          Your data is safe — this is a display problem, not a lost record. Try again, and if it keeps
          happening check that the database is reachable in Integrations.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={reset} className="btn btn-primary !py-2.5 !text-xs"><RefreshCw size={14} /> Try again</button>
          <Link href="/dashboard" className="btn btn-ghost !py-2.5 !text-xs">Back to overview</Link>
          <Link href="/dashboard/settings" className="btn btn-ghost !py-2.5 !text-xs"><LifeBuoy size={14} /> Check connection</Link>
        </div>
        {error.digest && <p className="mt-4 font-mono text-[0.65rem] text-stone">Reference: {error.digest}</p>}
      </div>
    </div>
  );
}
