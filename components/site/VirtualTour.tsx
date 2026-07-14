"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Play, X, MapPin, ArrowRight } from "lucide-react";

/**
 * Virtual tour module. Pass `videoUrl` (a YouTube/Vimeo embed URL or the venue's
 * 360 tour) to embed it; without one it shows a polished "book a live tour"
 * placeholder so the section always looks intentional.
 */
export function VirtualTour({
  videoUrl,
  poster = "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1800&q=80",
}: {
  videoUrl?: string;
  poster?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <Image src={poster} alt="The Farm 1893" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="container-x relative z-10 text-center text-parchment">
        <p className="eyebrow !text-brass-soft">See it for yourself</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Take a virtual tour</h2>
        <p className="mx-auto mt-4 max-w-lg text-parchment/80">Walk the orchard, step inside the barn, and picture your day — from anywhere.</p>
        <button
          onClick={() => setOpen(true)}
          className="group mx-auto mt-9 grid h-20 w-20 place-items-center rounded-full bg-parchment/95 text-ink shadow-2xl transition hover:scale-105"
          aria-label="Play virtual tour"
        >
          <Play size={30} className="ml-1 fill-current" />
          <span className="absolute h-20 w-20 animate-ping rounded-full bg-parchment/40" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-6 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <button className="absolute right-6 top-6 text-parchment/80 hover:text-parchment" aria-label="Close"><X size={32} /></button>
          <div className="w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {videoUrl ? (
              <div className="aspect-video overflow-hidden rounded-2xl bg-black">
                <iframe src={videoUrl} title="Virtual tour" className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; gyroscope" allowFullScreen />
              </div>
            ) : (
              <div className="rounded-2xl bg-parchment p-10 text-center">
                <MapPin className="mx-auto text-brass" size={34} />
                <h3 className="mt-4 font-display text-3xl text-ink">The full walkthrough is coming soon</h3>
                <p className="mx-auto mt-3 max-w-md text-ink-soft">We&apos;re filming a cinematic tour of the farm. In the meantime, nothing beats seeing it in person — let&apos;s find a time.</p>
                <Link href="/contact" className="btn btn-primary mt-6">Book a Private Tour <ArrowRight size={16} /></Link>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
