import { ContractsManager } from "@/components/crm/ContractsManager";
import { getContracts } from "@/lib/crm/data";

export const metadata = { title: "Contracts & Deposits" };

export default async function ContractsPage() {
  const { contracts, live } = await getContracts();
  return <ContractsManager initial={contracts} live={live} />;
}
