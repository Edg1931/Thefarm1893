import { TaskBoard } from "@/components/crm/TaskBoard";
import { getOpsTasks } from "@/lib/crm/data";

export const metadata = { title: "Operations" };

export default async function OperationsPage() {
  const { tasks, live } = await getOpsTasks();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Operations</h1>
        <p className="mt-1 text-stone">Cleaning, setup, lawn, and turnover — assigned to your team and tracked to done.</p>
      </div>
      <TaskBoard initial={tasks} live={live} />
    </div>
  );
}
