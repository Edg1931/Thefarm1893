"use client";

import { useEffect, useState } from "react";
import { Lock, LockOpen, X } from "lucide-react";

/**
 * Guest-facing privacy gate for the wedding microsite. Sections the couple marked
 * "private" are server-rendered with class `pv-private` (hidden by CSS). An
 * invited guest enters the couple's code to reveal them. Also reads the couple's
 * localStorage privacy overrides so their settings preview live in the same browser.
 *
 * Note: this is friendly "soft" privacy (deters casual visitors). True per-guest
 * privacy — where private content never reaches an un-invited browser — activates
 * with Supabase auth.
 */
export function PrivacyGate({
  slug,
  code,
  defaultPrivate,
}: {
  slug: string;
  code: string;
  defaultPrivate: string[];
}) {
  const [open, setOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState("");
  const [error, setError] = useState(false);
  const [privateKeys, setPrivateKeys] = useState<string[]>(defaultPrivate);

  // Compute effective private sections (couple overrides win) + restore unlock.
  useEffect(() => {
    let keys = defaultPrivate;
    try {
      const ov = JSON.parse(localStorage.getItem(`farm1893:privacy:${slug}`) || "null");
      if (ov) keys = Object.keys(ov).filter((k) => ov[k] === "private");
    } catch { /* ignore */ }
    setPrivateKeys(keys);

    const isUnlocked = sessionStorage.getItem(`farm1893:unlocked:${slug}`) === "1";
    setUnlocked(isUnlocked);
    applyVisibility(keys, isUnlocked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  function applyVisibility(keys: string[], isUnlocked: boolean) {
    document.querySelectorAll<HTMLElement>("[data-section]").forEach((el) => {
      const k = el.dataset.section!;
      const shouldHide = keys.includes(k) && !isUnlocked;
      el.classList.toggle("pv-private", shouldHide);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (entry.trim().toLowerCase() === code.toLowerCase()) {
      sessionStorage.setItem(`farm1893:unlocked:${slug}`, "1");
      setUnlocked(true);
      applyVisibility(privateKeys, true);
      setOpen(false);
      setError(false);
    } else {
      setError(true);
    }
  }

  // Nothing private, or already unlocked → no prompt needed.
  if (privateKeys.length === 0 || unlocked) return null;

  return (
    <>
      {/* Floating unlock pill */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[color:var(--color-ink)] px-5 py-3 text-sm text-parchment shadow-[0_20px_50px_-15px_rgba(28,26,23,0.7)] ring-1 ring-brass/30"
      >
        <Lock size={15} className="text-brass-soft" />
        Invited guest? Unlock the private details
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-parchment p-7 text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} aria-label="Close" className="absolute right-4 top-4 text-stone hover:text-ink"><X size={20} /></button>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brass/15"><Lock className="text-brass" size={26} /></div>
            <h3 className="mt-4 font-display text-2xl text-ink">Just for our guests 💛</h3>
            <p className="mt-2 text-sm text-ink-soft">Enter the invite code from your invitation to see the schedule, room assignments, and more.</p>
            <form onSubmit={submit} className="mt-5">
              <input
                autoFocus
                value={entry}
                onChange={(e) => { setEntry(e.target.value); setError(false); }}
                placeholder="Invite code"
                className={`w-full rounded-xl border bg-bone px-4 py-3 text-center uppercase tracking-widest outline-none ${error ? "border-terracotta" : "border-ink/15 focus:border-sage"}`}
              />
              {error && <p className="mt-2 text-xs text-terracotta">That code doesn&apos;t match — check your invitation.</p>}
              <button type="submit" className="btn btn-primary mt-4 w-full"><LockOpen size={16} /> Unlock</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
