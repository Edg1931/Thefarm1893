import { CalendarClock } from "lucide-react";
import { bookedDates } from "@/lib/crm/sample-data";

/** Counts open peak-season (May–Oct) Saturdays left in the current year. */
function openSaturdaysLeft(): number {
  const taken = new Set(bookedDates);
  const now = new Date();
  const year = now.getFullYear();
  const end = new Date(year, 11, 31);
  const d = new Date(now);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7)); // next Saturday
  let count = 0;
  while (d <= end) {
    const m = d.getMonth();
    const iso = d.toISOString().slice(0, 10);
    if (m >= 4 && m <= 9 && !taken.has(iso)) count++;
    d.setDate(d.getDate() + 7);
  }
  return count;
}

export function ScarcityBadge({ light = false }: { light?: boolean }) {
  const left = openSaturdaysLeft();
  if (left <= 0) return null;
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${light ? "bg-white/12 text-parchment ring-1 ring-white/25" : "bg-terracotta/10 text-terracotta ring-1 ring-terracotta/25"}`}>
      <CalendarClock size={15} />
      Only {left} peak Saturday{left === 1 ? "" : "s"} left in {new Date().getFullYear()}
    </div>
  );
}
