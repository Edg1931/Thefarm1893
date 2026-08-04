import { ProposalStudio } from "@/components/crm/ProposalStudio";
import { getLeads } from "@/lib/crm/data";

export const metadata = { title: "AI Proposals" };

export default async function ProposalsPage() {
  // Real leads — the picker used to be hardcoded to sample data, so staff
  // couldn't build a proposal for an actual client.
  const { leads, live } = await getLeads();
  return <ProposalStudio leads={leads} live={live} />;
}
