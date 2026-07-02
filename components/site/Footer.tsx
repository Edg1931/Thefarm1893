import Link from "next/link";
import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import { Logo } from "./Logo";
import { business, nav } from "@/lib/content";

export function Footer() {
  return (
    <footer className="bg-[color:var(--color-ink)] text-parchment">
      <div className="container-x py-20">
        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-parchment/60">
              A historic 1893 orchard reborn as an all-in-one wedding &amp;
              gathering venue in {business.city}, {business.region}. Come for the
              day — stay for the whole weekend.
            </p>
            <div className="mt-6 flex gap-3">
              <a href={business.instagram} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:bg-white/10" aria-label="Instagram">
                <Instagram size={17} />
              </a>
              <a href={business.facebook} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 transition hover:bg-white/10" aria-label="Facebook">
                <Facebook size={17} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="eyebrow !text-brass-soft">Explore</h4>
            <ul className="mt-5 space-y-3">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-parchment/70 transition hover:text-parchment">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="eyebrow !text-brass-soft">Visit &amp; Inquire</h4>
            <ul className="mt-5 space-y-4 text-sm text-parchment/70">
              <li className="flex gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-brass" />
                <span>{business.address}</span>
              </li>
              <li>
                <a href={business.phoneHref} className="flex gap-3 hover:text-parchment">
                  <Phone size={17} className="mt-0.5 shrink-0 text-brass" />
                  {business.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${business.email}`} className="flex gap-3 hover:text-parchment">
                  <Mail size={17} className="mt-0.5 shrink-0 text-brass" />
                  {business.email}
                </a>
              </li>
            </ul>
            <Link href="/contact" className="btn btn-light mt-7 !py-2.5 !px-6 !text-[0.72rem]">
              Check Your Date
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-parchment/40 md:flex-row">
          <p>© {business.established}–{new Date().getFullYear()} {business.name}. All rights reserved.</p>
          <p className="font-script text-lg text-brass-soft">Est. {business.established}</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-parchment/70">Privacy</Link>
            <Link href="/dashboard" className="hover:text-parchment/70">Venue Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
