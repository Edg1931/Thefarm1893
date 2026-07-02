import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import { Logo } from "@/components/site/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-bone px-6 text-center">
      <div>
        <div className="flex justify-center"><Logo /></div>
        <p className="mt-12 font-script text-5xl text-brass">oh, dear</p>
        <h1 className="mt-2 font-display text-6xl text-ink md:text-7xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-ink-soft">
          Looks like this path grew over like an old orchard row. Let&apos;s get you back to the good stuff.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-primary"><Home size={16} /> Back Home</Link>
          <Link href="/contact" className="btn btn-ghost">Book a Tour <ArrowRight size={16} /></Link>
        </div>
      </div>
    </div>
  );
}
