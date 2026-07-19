import { VendorManager } from "@/components/crm/VendorManager";
import { getVendors } from "@/lib/crm/data";

export const metadata = { title: "Vendor Network" };

export default async function VendorsCrmPage() {
  const { vendors, live } = await getVendors();
  return <VendorManager initial={vendors} live={live} />;
}
