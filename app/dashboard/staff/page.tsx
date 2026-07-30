import { StaffManager } from "@/components/crm/StaffManager";
import { getStaff } from "@/lib/crm/data";

export const metadata = { title: "Staff" };

export default async function StaffPage() {
  const { staff, live } = await getStaff();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Staff</h1>
        <p className="mt-1 text-stone">Accounts, permissions, and the time clock — the foundation for scheduling and payroll.</p>
      </div>
      <StaffManager initial={staff} live={live} />
    </div>
  );
}
