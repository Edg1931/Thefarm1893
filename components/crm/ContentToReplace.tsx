import { CheckCircle2, AlertTriangle, FileText } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { contentStatus, type ContentKey } from "@/lib/content";
import { CONTENT_GUIDANCE } from "@/lib/content-flags";

/**
 * Everything still running on placeholder content, so nothing fake reaches a
 * real guest by accident. Flip the entry in lib/content.ts → contentStatus to
 * "real" and the row turns green (and any guard on it lifts automatically).
 */
export function ContentToReplace() {
  const keys = Object.keys(contentStatus) as ContentKey[];
  const pending = keys.filter((k) => contentStatus[k] === "placeholder");

  return (
    <Panel
      title={<span className="flex items-center gap-2"><FileText size={16} className="text-brass" /> Content to replace before launch</span>}
      action={<span className="text-sm text-stone">{pending.length} of {keys.length} pending</span>}
    >
      {pending.length === 0 ? (
        <p className="rounded-xl bg-sage/10 p-4 text-sm text-sage-deep">All real content is in place — nothing placeholder is showing to guests.</p>
      ) : (
        <p className="mb-3 rounded-xl bg-brass/10 px-4 py-2.5 text-sm text-ink ring-1 ring-brass/25">
          These are the last things between the site and launch. Everything else is built and working.
        </p>
      )}

      <ul className="space-y-2">
        {keys.map((k) => {
          const done = contentStatus[k] === "real";
          const g = CONTENT_GUIDANCE[k];
          return (
            <li key={k} className={`flex items-start gap-3 rounded-xl p-3 ${done ? "bg-bone" : "bg-brass/5 ring-1 ring-brass/20"}`}>
              <span className="mt-0.5 shrink-0">
                {done ? <CheckCircle2 size={17} className="text-sage-deep" /> : <AlertTriangle size={17} className="text-brass" />}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${done ? "text-stone line-through" : "text-ink"}`}>{g.label}</p>
                {!done && (
                  <>
                    <p className="text-xs text-stone">{g.why}</p>
                    <p className="mt-1 font-mono text-[0.68rem] text-stone">{g.where}</p>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
