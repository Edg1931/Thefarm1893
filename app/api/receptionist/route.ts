import { NextResponse } from "next/server";
import { receptionistReply } from "@/lib/services/receptionist";
import { rateLimit, clientIp, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!rateLimit(`reception:${clientIp(req)}`, 20, 60_000)) return tooMany();
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }
    const { reply, mocked } = await receptionistReply(messages);
    return NextResponse.json({ reply, mocked });
  } catch {
    return NextResponse.json(
      { reply: "Sorry, I hit a snag — please call us and we'll help right away." },
      { status: 200 }
    );
  }
}
