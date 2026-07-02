import { NextResponse } from "next/server";
import { designMyDay } from "@/lib/services/design";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { season, palette, style } = await req.json();
    const result = await designMyDay({
      season: season ?? "fall",
      palette: palette ?? "blush-sage",
      style: style ?? "rustic",
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not build your vision." }, { status: 500 });
  }
}
