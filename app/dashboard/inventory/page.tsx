import { InventoryTable } from "@/components/crm/InventoryTable";
import { getInventory } from "@/lib/crm/data";

export const metadata = { title: "Inventory" };

export default async function InventoryPage() {
  const { items, live } = await getInventory();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Inventory</h1>
        <p className="mt-1 text-stone">Tables, chairs, linens, and décor — with low-stock alerts before you run short.</p>
      </div>
      <InventoryTable initial={items} live={live} />
    </div>
  );
}
