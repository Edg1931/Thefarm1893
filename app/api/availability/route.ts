import { NextResponse } from "next/server";
import { bookedDates } from "@/lib/crm/sample-data";
import { getServiceClient } from "@/lib/supabase/server";
import { goldenHourPlan } from "@/lib/services/golden-hour";
import { priceForDate } from "@/lib/services/pricing";

export const runtime = "nodejs";

function nextOpenSaturdays(from: Date, taken: Set<string>, n = 3) {
  const out: string[] = [];
  const d = new Date(from);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); // next Saturday
  let guard = 0;
  while (out.length < n && guard < 60) {
    const iso = d.toISOString().slice(0, 10);
    if (!taken.has(iso)) out.push(iso);
    d.setDate(d.getDate() + 7);
    guard++;
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const { date } = await req.json();
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    let taken = new Set(bookedDates);

    // If a DB is connected, prefer live booked dates.
    const supabase = getServiceClient();
    if (supabase) {
      const { data } = await supabase
        .from("events")
        .select("event_date")
        .in("status", ["confirmed", "tentative"]);
      if (data) taken = new Set(data.map((r: { event_date: string }) => r.event_date));
    }

    const available = !taken.has(date);
    const alternatives = available ? [] : nextOpenSaturdays(new Date(date), taken);

    return NextResponse.json({
      date,
      available,
      alternatives,
      // Live intelligence for the couple:
      quote: available ? priceForDate(date) : null,
      goldenHour: available ? goldenHourPlan(date) : null,
      message: available
        ? "Good news — that date is open! Reserve a private tour to lock it in."
        : "That date is spoken for, but here are the next open Saturdays.",
    });
  } catch {
    return NextResponse.json({ error: "Could not check that date." }, { status: 500 });
  }
}
