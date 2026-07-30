import { MaintenanceSchedule } from "@/components/crm/MaintenanceSchedule";
import { getMaintenance } from "@/lib/crm/data";

export const metadata = { title: "Maintenance" };

export default async function MaintenancePage() {
  const { assets, live } = await getMaintenance();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Maintenance</h1>
        <p className="mt-1 text-stone">HVAC, pool, septic, and grounds — scheduled, logged, and never overdue by surprise.</p>
      </div>
      <MaintenanceSchedule initial={assets} live={live} />
    </div>
  );
}
