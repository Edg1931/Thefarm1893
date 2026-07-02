import Link from "next/link";
import { business } from "@/lib/content";

export function Logo({ light = false }: { light?: boolean }) {
  const color = light ? "#f7f3ec" : "#1c1a17";
  return (
    <Link href="/" className="group inline-flex items-center gap-3" aria-label={business.name}>
      <svg width="40" height="40" viewBox="0 0 64 64" className="shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5" aria-hidden>
        <g fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
          <path d="M12 30 L32 15 L52 30 V50 H12 Z" />
          <path d="M25 50 V37 H39 V50" />
          <path d="M6 30 L12 30 M52 30 L58 30" />
        </g>
        <circle cx="48" cy="19" r="3.4" fill="#b0563b" />
        <circle cx="42" cy="24" r="2.2" fill="#7c8768" />
      </svg>
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[1.35rem] font-semibold tracking-tight"
          style={{ color }}
        >
          The Farm 1893
        </span>
        <span
          className="font-script text-base -mt-0.5"
          style={{ color: light ? "#cbb488" : "#b18f57" }}
        >
          Wedding &amp; Gathering Venue
        </span>
      </span>
    </Link>
  );
}
