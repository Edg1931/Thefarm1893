import { NextResponse } from "next/server";
import { generateMarketingCopy } from "@/lib/services/insights";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { kind, topic, tone } = await req.json();
    const result = await generateMarketingCopy({
      kind: kind ?? "instagram",
      topic: topic ?? "a summer orchard wedding",
      tone,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Could not generate content." }, { status: 500 });
  }
}
