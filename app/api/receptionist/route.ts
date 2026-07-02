import { NextResponse } from "next/server";
import { receptionistReply } from "@/lib/services/receptionist";

export const runtime = "nodejs";

export async function POST(req: Request) {
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
