"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, Check, ArrowRight } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
import { DEMO_LEAD_ID } from "@/lib/crm/portal";

/**
 * Passwordless sign-in for couples and vendors. Posts to /api/portal/session,
 * which sends a Supabase magic link when configured. In demo mode the route
 * replies { demo: true } and we offer a direct link into the sample portal.
 */
export default function PortalSignInPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "demo" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy"); setMsg("");
    try {
      const res = await fetch("/api/portal/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send the link.");
      setState(data.demo ? "demo" : "sent");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  return (
    <PortalShell title="Your planning portal" subtitle="Sign in with a secure link — no password needed.">
      <div className="mx-auto max-w-md rounded-2xl border border-ink/8 bg-parchment p-8">
        {state === "sent" ? (
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-sage/15"><Check size={22} className="text-sage-deep" /></span>
            <h2 className="mt-4 font-display text-2xl text-ink">Check your inbox</h2>
            <p className="mt-2 text-sm text-stone">We sent a sign-in link to <b className="text-ink">{email}</b>. It expires in a little while — open it on any device.</p>
          </div>
        ) : state === "demo" ? (
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brass/15"><Mail size={22} className="text-brass" /></span>
            <h2 className="mt-4 font-display text-2xl text-ink">Demo mode</h2>
            <p className="mt-2 text-sm text-stone">Email sign-in turns on once Supabase is connected. In the meantime, explore the sample planning portal.</p>
            <Link href={`/portal/${DEMO_LEAD_ID}`} className="btn btn-primary mt-5">Open the sample portal <ArrowRight size={15} /></Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="portal-email" className="block text-sm font-medium text-ink">Email address</label>
            <input
              id="portal-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-brass"
            />
            {state === "error" && <p className="text-sm text-terracotta">{msg}</p>}
            <button type="submit" disabled={state === "busy"} className="btn btn-primary w-full disabled:opacity-60">
              {state === "busy" ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />} Email me a sign-in link
            </button>
            <p className="pt-1 text-center text-xs text-stone">Couples and vendors only. Farm staff <Link href="/login" className="text-brass hover:underline">sign in here</Link>.</p>
          </form>
        )}
      </div>
    </PortalShell>
  );
}
