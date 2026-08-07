"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

type Hit = { kind: string; label: string; detail: string; href: string };

/**
 * The topbar search box was an input wired to nothing — it accepted typing and
 * had no handler at all. It now searches leads, bookings, vendors, and silo
 * stays, and Enter jumps to the first result. Debounced so typing a name
 * doesn't fire a request per keystroke.
 */
export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (q.trim().length < 2) { setHits([]); return; }
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q.trim())}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) { setHits(d.hits ?? []); setOpen(true); } })
        .catch(() => { if (!cancelled) setHits([]); })
        .finally(() => { if (!cancelled) setBusy(false); });
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  function go(href: string) {
    setOpen(false); setQ("");
    router.push(href);
  }

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-bone px-4 py-2 text-sm text-stone focus-within:border-brass">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        <input
          aria-label="Search leads, bookings, vendors"
          placeholder="Search leads, bookings, vendors…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => hits.length && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) go(hits[0].href);
            if (e.key === "Escape") { setOpen(false); setQ(""); }
          }}
          className="w-72 bg-transparent text-ink outline-none placeholder:text-stone"
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 z-50 mt-2 w-96 overflow-hidden rounded-2xl border border-ink/10 bg-parchment shadow-[var(--shadow-lift)]">
          {hits.length === 0 && !busy && (
            <p className="px-4 py-6 text-center text-sm text-stone">Nothing matching &ldquo;{q.trim()}&rdquo;.</p>
          )}
          <ul className="max-h-96 overflow-y-auto">
            {hits.map((h, i) => (
              <li key={i}>
                <button onClick={() => go(h.href)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-bone">
                  <span className="shrink-0 rounded-full bg-ink/8 px-2 py-0.5 text-[0.62rem] uppercase tracking-wide text-stone">{h.kind}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{h.label}</span>
                    <span className="block truncate text-xs text-stone">{h.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
