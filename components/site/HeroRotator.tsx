"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Homepage hero that slowly cross-fades through the venue photos in the `hero/`
 * folder. Static if only one image. The dark gradient keeps the headline legible.
 */
export function HeroRotator({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setActive((v) => (v + 1) % images.length), 6500);
    return () => clearInterval(t);
  }, [images.length]);

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : ""}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1800ms] ease-in-out ${
            i === active ? "animate-zoom opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60" />
      {images.length > 1 && (
        <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-6 bg-parchment" : "w-1.5 bg-parchment/40"}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
