import { NextResponse } from "next/server";
import { generateProposal } from "@/lib/services/proposal";
import { leads } from "@/lib/crm/sample-data";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json();
    const lead = leads.find((l) => l.id === leadId) ?? leads[0];
    const proposal = await generateProposal(lead);
    return NextResponse.json(proposal);
  } catch {
    return NextResponse.json({ error: "Could not generate proposal." }, { status: 500 });
  }
}
