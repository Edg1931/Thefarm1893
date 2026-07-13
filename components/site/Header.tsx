"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { Logo } from "./Logo";
import { nav, navPrimary, business } from "@/lib/content";

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[color:var(--color-bone)]/95 backdrop-blur-md shadow-[0_1px_0_rgba(28,26,23,0.08)] py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container-x flex items-center justify-between">
        <div className={scrolled ? "" : "drop-shadow-sm"}>
          <Logo />
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {navPrimary.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`link-underline text-[0.82rem] font-medium uppercase tracking-[0.14em] transition-colors hover:text-ink ${active ? "text-ink" : "text-ink-soft"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={business.phoneHref} className="flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-ink">
            <Phone size={15} className="text-brass" />
            {business.phone}
          </a>
          <Link href="/contact" className="btn btn-primary !py-2.5 !px-6 !text-[0.72rem]">
            Book a Tour
          </Link>
        </div>

        <button
          className="lg:hidden p-2 text-ink"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={26} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-[color:var(--color-ink)] text-parchment transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Logo light />
          <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
            <X size={28} className="text-parchment" />
          </button>
        </div>
        <nav className="mt-8 flex flex-col gap-1 px-8">
          {nav.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="border-b border-white/10 py-4 font-display text-3xl text-parchment/90"
              style={{ animation: open ? `riseIn 0.5s ${i * 0.05}s both` : undefined }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 flex flex-col gap-3 px-8">
          <a href={business.phoneHref} className="btn btn-light">
            <Phone size={16} /> {business.phone}
          </a>
          <Link href="/contact" onClick={() => setOpen(false)} className="btn bg-parchment text-ink">
            Book a Tour
          </Link>
        </div>
      </div>
    </header>
  );
}
