"use client";

import { useState } from "react";
import { Check, Loader2, Phone } from "lucide-react";
import { business } from "@/lib/content";
import { PhoneLink } from "./PhoneLink";

/** Guest taps "I've arrived" — records the check-in against the booking token. */
export function CheckinComplete({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function done() {
    setState("busy");
    try {
      const res = await fetch(`/api/checkin/${encodeURIComponent(token)}`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setState("done");
    } catch {
      setState("error"); // never claim success on a failed check-in
    }
  }

  if (state === "done") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-sage/15 px-5 py-3 text-sage-deep">
        <Check size={18} /> You&apos;re all checked in — welcome to the Farm!
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={done} disabled={state === "busy"} className="btn btn-primary disabled:opacity-60">
        {state === "busy" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} I&apos;ve arrived — check me in
      </button>
      {state === "error" && (
        <p className="flex items-center gap-1.5 text-sm text-terracotta">
          That didn&apos;t go through — tap again, or call us at{" "}
          <PhoneLink className="inline-flex items-center gap-1 font-medium underline"><Phone size={13} /> {business.phone}</PhoneLink>.
        </p>
      )}
    </div>
  );
}
