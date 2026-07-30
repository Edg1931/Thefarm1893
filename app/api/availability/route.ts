import { NextResponse } from "next/server";
import { checkVenueDate } from "@/lib/services/availability";
import { goldenHourPlan } from "@/lib/services/golden-hour";
import { priceForDate } from "@/lib/services/pricing";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { date } = await req.json();
    if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

    // One engine consults bookings, tentative holds, and availability blocks
    // (maintenance / iCal / OTA) — live rows when configured, else sample data.
    const { available, alternatives } = await checkVenueDate(date);

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
