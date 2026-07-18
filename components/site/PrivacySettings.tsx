"use client";

import { useState } from "react";
import { Eye, Lock, Copy, Check, Shield } from "lucide-react";

type Vis = "public" | "private";

export function PrivacySettings({
  slug,
  accessCode,
  sections,
  initial,
}: {
  slug: string;
  accessCode: string;
  sections: { key: string; label: string; note: string }[];
  initial: Record<string, Vis>;
}) {
  const [privacy, setPrivacy] = useState<Record<string, Vis>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem(`farm1893:privacy:${slug}`) || "null");
        if (saved) return { ...initial, ...saved };
      } catch { /* ignore */ }
    }
    return initial;
  });
  const [copied, setCopied] = useState(false);

  function toggle(key: string) {
    setPrivacy((p) => {
      const next = { ...p, [key]: p[key] === "private" ? "public" : "private" as Vis };
      try { localStorage.setItem(`farm1893:privacy:${slug}`, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  return (
    <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-brass"><Shield size={18} /><span className="text-xs font-semibold uppercase tracking-widest">Guest-site privacy</span></div>
      <h3 className="mt-2 font-display text-2xl text-ink">Choose what your guests see</h3>
      <p className="mt-1 text-sm text-stone">Keep the private details for invited guests only. Public sections are visible to anyone with your link.</p>

      <div className="mt-5 space-y-2">
        {sections.map((s) => {
          const isPrivate = privacy[s.key] === "private";
          return (
            <div key={s.key} className="flex items-center justify-between rounded-xl bg-bone p-3.5">
              <div>
                <p className="text-sm font-medium text-ink">{s.label}</p>
                {s.note && <p className="text-xs text-stone">{s.note}</p>}
              </div>
              <button
                onClick={() => toggle(s.key)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${isPrivate ? "bg-ink text-parchment" : "bg-sage/15 text-sage-deep"}`}
              >
                {isPrivate ? <><Lock size={13} /> Private</> : <><Eye size={13} /> Public</>}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-brass/30 bg-brass/8 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-stone">Guest invite code</p>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-display text-2xl tracking-widest text-ink">{accessCode}</span>
          <button
            onClick={() => { navigator.clipboard?.writeText(accessCode).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
            className="flex items-center gap-1 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs text-ink-soft hover:border-ink/40"
          >
            {copied ? <><Check size={12} className="text-sage" /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <p className="mt-2 text-xs text-stone">Add this code to your invitations so guests can unlock the private sections.</p>
      </div>
    </div>
  );
}
