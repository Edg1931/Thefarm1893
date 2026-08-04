"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { nav, navPrimary, business } from "@/lib/content";
import { PhoneLink } from "./PhoneLink";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll + close on Escape while the mobile drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[color:var(--color-bone)]/95 backdrop-blur-md shadow-[0_1px_0_rgba(28,26,23,0.08)] py-3"
          : "bg-transparent py-6"
      }`}
    >
      {/* Over a hero photo (not scrolled) everything must render LIGHT — the dark
          ink palette was invisible against the hero's dark scrim. Once the bar
          picks up its bone background on scroll, revert to the ink palette. */}
      <div className="container-x flex items-center justify-between">
        <div className={scrolled ? "" : "drop-shadow-md"}>
          <Logo light={!scrolled} />
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navPrimary.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`link-underline text-[0.82rem] font-medium uppercase tracking-[0.14em] transition-colors ${
                  scrolled
                    ? `hover:text-ink ${active ? "text-ink" : "text-ink-soft"}`
                    : `drop-shadow-sm hover:text-white ${active ? "text-white" : "text-white/85"}`
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <PhoneLink className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            scrolled ? "text-ink-soft hover:text-ink" : "text-white/90 drop-shadow-sm hover:text-white"
          }`}>
            <Phone size={15} className={scrolled ? "text-brass" : "text-brass-soft"} />
            {business.phone}
          </PhoneLink>
          <Link
            href="/contact"
            className={`btn !py-2.5 !px-6 !text-[0.72rem] ${scrolled ? "btn-primary" : "bg-parchment text-ink hover:bg-white"}`}
          >
            Book a Tour
          </Link>
        </div>

        <button
          className={`lg:hidden p-2 transition-colors ${scrolled ? "text-ink" : "text-white drop-shadow-md"}`}
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile drawer — scrollable so the nav + primary CTA never clip */}
      <div
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-[color:var(--color-ink)] text-parchment transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="sticky top-0 flex items-center justify-between bg-[color:var(--color-ink)] px-6 py-6">
          <Logo light />
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
            <X size={28} className="text-parchment" />
          </button>
        </div>
        <nav className="mt-2 flex flex-col gap-1 px-8">
          {nav.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/10 py-3.5 font-display text-2xl text-parchment/90"
              style={{ animation: open ? `riseIn 0.5s ${i * 0.05}s both` : undefined }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mb-8 mt-8 flex flex-col gap-3 px-8">
          <PhoneLink className="btn btn-light">
            <Phone size={16} /> {business.phone}
          </PhoneLink>
          <Link href="/contact" onClick={() => setOpen(false)} className="btn bg-parchment text-ink">
            Book a Tour
          </Link>
        </div>
      </div>
    </header>
  );
}
