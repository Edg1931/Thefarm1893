import { NextResponse } from "next/server";
import { matchWithRationale } from "@/lib/services/vendors";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { budget, categories, style } = await req.json();
    const result = await matchWithRationale({ budget, categories, style });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not build a match." }, { status: 500 });
  }
}
