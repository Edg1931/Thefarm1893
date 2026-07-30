"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import type { Property } from "@/lib/crm/data";

const KEY = "farm1893:activeProperty";

/**
 * Property switcher for multi-property owners. Defaults to the single Farm 1893
 * property so single-venue installs are unchanged; the selection persists in
 * the browser and scopes the dashboard as property filtering rolls out.
 */
export function PropertySwitcher({ properties }: { properties: Property[] }) {
  const [active, setActive] = useState(properties[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (saved && properties.some((p) => p.id === saved)) setActive(saved);
  }, [properties]);

  function pick(id: string) {
    setActive(id);
    setOpen(false);
    try { window.localStorage.setItem(KEY, id); } catch { /* ignore */ }
  }

  if (properties.length === 0) return null;
  const current = properties.find((p) => p.id === active) ?? properties[0];

  // Single property → show a static label (no dropdown noise).
  if (properties.length === 1) {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-parchment/70">
        <Building2 size={15} className="text-brass-soft" />
        <span className="truncate text-xs">{current.name}</span>
      </div>
    );
  }

  return (
    <div className="relative mb-3">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2 text-parchment/80 hover:bg-white/10">
        <span className="flex items-center gap-2 truncate"><Building2 size={15} className="text-brass-soft" /> <span className="truncate text-xs">{current.name}</span></span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl bg-[color:var(--color-ink)] ring-1 ring-white/10">
          {properties.map((p) => (
            <li key={p.id}>
              <button onClick={() => pick(p.id)} className={`block w-full px-3 py-2 text-left text-xs ${p.id === active ? "bg-brass/15 text-parchment" : "text-parchment/70 hover:bg-white/5"}`}>{p.name}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
