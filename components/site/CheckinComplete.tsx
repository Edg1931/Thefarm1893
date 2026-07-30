"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

/** Guest taps "I've arrived" — records the check-in against the booking token. */
export function CheckinComplete({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");

  async function done() {
    setState("busy");
    try {
      await fetch(`/api/checkin/${encodeURIComponent(token)}`, { method: "POST" });
    } catch { /* best-effort */ }
    setState("done");
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-sage/15 px-5 py-3 text-sage-deep">
        <Check size={18} /> You're all checked in — welcome to the Farm!
      </div>
    );
  }
  return (
    <button onClick={done} disabled={state === "busy"} className="btn btn-primary disabled:opacity-60">
      {state === "busy" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} I&apos;ve arrived — check me in
    </button>
  );
}
