"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, Globe, User, ShieldCheck } from "lucide-react";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";

/**
 * Top-right account control. Shows who's signed in and a dropdown with
 * Integrations, "Back to website", and Sign out. In demo mode (Supabase not
 * configured) it degrades gracefully to a "Demo mode" chip.
 */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const configured = supabaseConfigured();

  useEffect(() => {
    if (!configured) return;
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => {});
  }, [configured]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function signOut() {
    setSigningOut(true);
    try {
      if (configured) await createClient().auth.signOut();
    } catch {
      /* ignore */
    }
    window.location.assign("/login");
  }

  const name = email ? email.split("@")[0] : "Farm Team";
  const initials = name.slice(0, 1).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-bone"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="grid h-10 w-10 place-items-center rounded-full bg-sage-deep font-display text-lg text-parchment">
          {initials}
        </div>
        <div className="hidden text-left leading-none sm:block">
          <p className="text-sm font-medium capitalize text-ink">{name}</p>
          <p className="text-xs text-stone">{configured ? "Owner" : "Demo mode"}</p>
        </div>
        <ChevronDown size={16} className={`text-stone transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-2xl border border-ink/10 bg-parchment shadow-xl"
        >
          <div className="border-b border-ink/8 bg-bone px-4 py-3">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <User size={14} className="text-brass" /> <span className="capitalize">{name}</span>
            </p>
            <p className="mt-0.5 truncate text-xs text-stone">{email ?? "Not signed in (demo)"}</p>
            {configured && (
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-sage/15 px-2 py-0.5 text-[0.65rem] font-medium text-sage-deep">
                <ShieldCheck size={11} /> Live · Supabase
              </p>
            )}
          </div>
          <div className="p-1.5">
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-soft transition hover:bg-bone"
            >
              <Settings size={16} /> Integrations & settings
            </Link>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-ink-soft transition hover:bg-bone"
            >
              <Globe size={16} /> Back to website
            </Link>
          </div>
          <div className="border-t border-ink/8 p-1.5">
            {configured ? (
              <button
                onClick={signOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-terracotta transition hover:bg-terracotta/10 disabled:opacity-60"
              >
                <LogOut size={16} /> {signingOut ? "Signing out…" : "Sign out"}
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-bone"
              >
                <LogOut size={16} /> Staff sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
