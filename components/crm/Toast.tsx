"use client";

import { Check } from "lucide-react";

/**
 * Shared confirmation toast for the CRM.
 *
 * This markup was copy-pasted into eight components, all pinned to the same
 * bottom-right coordinates and z-index — so two toasts firing at once stacked
 * invisibly on top of each other. Centralised here; `SyncErrorToast` keeps the
 * bottom-LEFT slot so a failure and a confirmation never collide.
 *
 * Render conditionally: {toast && <Toast message={toast} />}
 */
export function Toast({ message, tone = "success" }: { message: string; tone?: "success" | "info" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl px-5 py-3 text-sm text-parchment shadow-[var(--shadow-lift)] ${
        tone === "success" ? "bg-sage-deep" : "bg-ink"
      }`}
    >
      <Check size={16} /> {message}
    </div>
  );
}
