"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";

export function GalleryGrid({ images }: { images: string[] }) {
  const [active, setActive] = useState<number | null>(null);
  const wall = images;

  return (
    <>
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {wall.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className="group relative block w-full overflow-hidden rounded-xl"
          >
            <Image
              src={src}
              alt={`The Farm 1893 — photo ${i + 1}`}
              width={600}
              height={i % 3 === 0 ? 800 : 600}
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/15" />
          </button>
        ))}
      </div>

      {active !== null && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/90 p-6 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <button className="absolute right-6 top-6 text-parchment/80 hover:text-parchment" aria-label="Close">
            <X size={32} />
          </button>
          <Image
            src={wall[active]}
            alt=""
            width={1400}
            height={1000}
            className="max-h-[85vh] w-auto rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
