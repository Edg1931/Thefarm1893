import { PipelineBoard } from "@/components/crm/PipelineBoard";
import { leads } from "@/lib/crm/sample-data";
import { formatCurrency } from "@/lib/utils";

export default function LeadsPage() {
  const total = leads.reduce((s, l) => s + l.budget, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Lead Pipeline</h1>
        <p className="mt-1 text-stone">
          {leads.length} active leads · {formatCurrency(total)} in play · drag cards to update stage, click to edit
        </p>
      </div>

      <div className="rounded-2xl border border-brass/25 bg-brass/8 p-4 text-sm text-ink-soft">
        <span className="font-medium text-ink">AI Copilot:</span> 2 leads have been in “New Inquiry” for over an hour.
        Hannah Whitfield (score 94) is your best shot to close this week — draft a follow-up now to keep momentum.
      </div>

      <PipelineBoard initial={leads} />
    </div>
  );
}
