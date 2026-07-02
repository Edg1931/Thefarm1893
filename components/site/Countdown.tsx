"use client";

import { useEffect, useState } from "react";

export function Countdown({ date }: { date: string }) {
  const [parts, setParts] = useState<{ d: number; h: number; m: number } | null>(null);

  useEffect(() => {
    const target = new Date(date + "T16:00:00").getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setParts({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
      });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [date]);

  if (!parts) return null;
  const item = (v: number, l: string) => (
    <div className="text-center">
      <p className="font-display text-4xl text-white md:text-5xl">{v}</p>
      <p className="text-[0.6rem] uppercase tracking-[0.2em] text-white/60">{l}</p>
    </div>
  );

  return (
    <div className="flex items-center gap-6">
      {item(parts.d, "Days")}
      {item(parts.h, "Hours")}
      {item(parts.m, "Minutes")}
    </div>
  );
}
