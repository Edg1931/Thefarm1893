import { CalendarClock, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
import { DocumentUpload } from "@/components/site/DocumentUpload";
import { sampleVendorSchedule } from "@/lib/crm/portal";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Vendor Portal", robots: { index: false } };

export default function VendorPortalPage() {
  const schedule = sampleVendorSchedule;
  const needsInsurance = schedule.some((s) => !s.insuranceOnFile);

  return (
    <PortalShell title="Vendor Portal" subtitle="Your upcoming events at The Farm 1893.">
      {needsInsurance && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-terracotta/12 px-4 py-3 text-sm text-ink ring-1 ring-terracotta/25">
          <ShieldAlert size={16} className="text-terracotta" /> One or more events are missing a certificate of insurance. Please upload it below.
        </div>
      )}

      <div className="space-y-4">
        {schedule.map((s, i) => (
          <div key={i} className="rounded-2xl border border-ink/8 bg-parchment p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 font-display text-xl text-ink"><CalendarClock size={18} className="text-brass" /> {s.eventTitle}</p>
                <p className="mt-1 text-sm text-stone">{formatDate(s.eventDate)} · {s.role}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.status === "confirmed" ? "bg-sage/15 text-sage-deep" : "bg-brass/15 text-brass"}`}>{s.status}</span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink/8 pt-4 text-sm">
              <span className="flex items-center gap-1.5 text-ink-soft"><Clock size={15} className="text-stone" /> Arrive {s.arrivalTime}</span>
              {s.insuranceOnFile ? (
                <span className="flex items-center gap-1.5 text-sage-deep"><ShieldCheck size={15} /> Insurance on file</span>
              ) : (
                <span className="flex items-center gap-1.5 text-terracotta"><ShieldAlert size={15} /> Insurance needed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-ink/8 bg-parchment p-6">
        <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><ShieldCheck size={18} className="text-brass" /> Certificate of insurance</h2>
        <p className="mt-1 text-sm text-stone">Upload your current COI — we keep it on file for every event you work.</p>
        <div className="mt-4"><DocumentUpload leadId="vendor" kind="insurance" /></div>
      </section>
    </PortalShell>
  );
}
