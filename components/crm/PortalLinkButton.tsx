"use client";

import { useState } from "react";
import { Link2, Check, Loader2 } from "lucide-react";

/**
 * Staff action: mint a signed, expiring portal link for a client and copy it.
 * The couple can open it with no account — the token binds it to their booking.
 */
export function PortalLinkButton({ leadId, label = "Copy secure portal link" }: { leadId: string; label?: string }) {
  const [state, setState] = useState<"idle" | "busy" | "copied" | "error">("idle");

  async function make() {
    setState("busy");
    try {
      const res = await fetch("/api/portal/link", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error();
      await navigator.clipboard?.writeText(data.url).catch(() => {});
      setState("copied");
      setTimeout(() => setState("idle"), 3000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <button onClick={make} disabled={state === "busy"} className="btn btn-ghost !py-2 !text-xs disabled:opacity-60">
      {state === "busy" ? <Loader2 size={13} className="animate-spin" /> : state === "copied" ? <Check size={13} className="text-sage-deep" /> : <Link2 size={13} />}
      {state === "copied" ? "Link copied" : state === "error" ? "Couldn't create link" : label}
    </button>
  );
}
