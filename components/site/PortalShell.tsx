import Link from "next/link";
import { Logo } from "@/components/site/Logo";
import { business } from "@/lib/content";

/** Branded wrapper for the authenticated portals (couple / guest / vendor). */
export function PortalShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-ink/8 bg-parchment">
        <div className="container-x flex items-center justify-between py-4">
          {/* Logo renders its own <Link> — wrapping it produced nested <a> tags,
              which browsers un-nest during parsing, breaking hydration. */}
          <Logo />
          <span className="text-xs uppercase tracking-widest text-stone">Planning Portal</span>
        </div>
      </header>
      <main className="container-x py-10 md:py-14">
        <div className="mb-8">
          <h1 className="font-display text-4xl text-ink md:text-5xl">{title}</h1>
          {subtitle && <p className="mt-1 text-stone">{subtitle}</p>}
        </div>
        {children}
      </main>
      <footer className="container-x flex flex-col items-center gap-2 border-t border-ink/8 py-8 text-center text-sm text-stone">
        <p>{business.name} · {business.city}, {business.region}</p>
        <Link href="/contact" className="text-brass hover:underline">Need help? Contact us →</Link>
      </footer>
    </div>
  );
}
