import { Plus, Filter } from "lucide-react";
import { PipelineBoard } from "@/components/crm/PipelineBoard";
import { leads } from "@/lib/crm/sample-data";
import { formatCurrency } from "@/lib/utils";

export default function LeadsPage() {
  const total = leads.reduce((s, l) => s + l.budget, 0);
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Lead Pipeline</h1>
          <p className="mt-1 text-stone">
            {leads.length} active leads · {formatCurrency(total)} in play · drag cards to update stage
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost !py-2.5 !text-xs"><Filter size={15} /> Filter</button>
          <button className="btn btn-primary !py-2.5 !text-xs"><Plus size={15} /> Add Lead</button>
        </div>
      </div>

      <div className="rounded-2xl border border-brass/25 bg-brass/8 p-4 text-sm text-ink-soft">
        <span className="font-medium text-ink">AI Copilot:</span> 2 leads have been in “New Inquiry” for over an hour.
        Hannah Whitfield (score 94) is your best shot to close this week — draft a follow-up now to keep momentum.
      </div>

      <PipelineBoard initial={leads} />
    </div>
  );
}
