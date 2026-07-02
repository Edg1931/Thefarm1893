/* ============================================================================
   ONE-CLICK AI PROPOSALS
   Turns a lead into a personalized, itemized proposal in seconds. The estimate
   uses the dynamic-pricing engine; the personal note uses the pluggable AI core.
   (Canva/Adobe tools connected to the workspace can render this to a branded PDF.)
   ============================================================================ */

import { generateText } from "./ai";
import { priceForDate } from "./pricing";
import type { Lead } from "@/lib/crm/sample-data";

export type ProposalLine = { item: string; detail: string; amount: number };
export type Proposal = {
  lead: string;
  headline: string;
  note: string;
  packageName: string;
  lines: ProposalLine[];
  subtotal: number;
  deposit: number;
  validUntil: string;
  mocked: boolean;
};

function recommend(lead: Lead) {
  const guests = lead.guestCount ?? 0;
  const wedding = /wedding/i.test(lead.eventType);
  if (wedding && guests >= 90) return "The Weekend";
  if (wedding) return "The Gathering";
  if (guests >= 100) return "The Weekend";
  return "The Gathering";
}

export async function generateProposal(lead: Lead): Promise<Proposal> {
  const pkg = recommend(lead);
  const quote = priceForDate(lead.eventDate);
  const venue = pkg === "The Weekend" ? quote.price : Math.round(quote.price * 0.55 / 50) * 50;

  const lines: ProposalLine[] = [
    { item: `${pkg} Package`, detail: pkg === "The Weekend" ? "Exclusive Fri 3PM–Sun 11AM, farmhouse for 25" : "8-hour single-day venue access", amount: venue },
    { item: "Tables, chairs & farm seating", detail: `Setup for ${lead.guestCount ?? "your"} guests`, amount: 0 },
    { item: "Day-of venue coordinator", detail: "Included in every package", amount: 0 },
  ];
  if (lead.guestCount && lead.guestCount > 120) lines.push({ item: "Extended-guest service", detail: "For celebrations over 120", amount: 750 });
  if (pkg === "The Weekend") lines.push({ item: "Rehearsal dinner space", detail: "Friday evening, included", amount: 0 });

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const deposit = Math.round((subtotal * 0.25) / 50) * 50;
  const validDate = new Date(); validDate.setDate(validDate.getDate() + 14);

  const { text, mocked } = await generateText({
    system: `You are the owner of The Farm 1893 writing a short, warm, personal note (2-3 sentences) at the top of a wedding proposal. Reference their event details, make them feel special, and express genuine excitement to host them. No salutation line — just the note.`,
    messages: [{ role: "user", content: `Lead: ${lead.name}, ${lead.eventType}, ${lead.guestCount} guests, date ${lead.eventDate}, recommended ${pkg}.` }],
    maxTokens: 220,
    mock: () =>
      `${lead.name.split(" ")[0]}, we are so excited about the possibility of hosting your ${lead.eventType.toLowerCase()} at the farm! Based on your ${lead.guestCount ?? "guest"}-guest celebration, we've tailored the ${pkg} package to give you the whole experience — orchard ceremony, barn reception, and time to simply enjoy it. We'd love to walk the grounds with you and make it real. 🌾`,
  });

  return {
    lead: lead.name,
    headline: `A ${lead.eventType} at The Farm 1893`,
    note: text,
    packageName: pkg,
    lines,
    subtotal,
    deposit,
    validUntil: validDate.toISOString().slice(0, 10),
    mocked,
  };
}
