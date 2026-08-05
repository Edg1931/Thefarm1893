"use client";

import { useEffect, useState, useRef } from "react";
import { Handshake, DollarSign, Send, Award, Star, Plus, X, Check, DownloadCloud, Eye, Images } from "lucide-react";
import { Panel, StatCard } from "@/components/crm/widgets";
import { vendorRecords as seed, type VendorRecord, type VendorProfile } from "@/lib/crm/sample-data";
import { getAddedVendors, addVendorLocal, syncToApi, newId, getVendorProfiles, setVendorProfile } from "@/lib/crm/store";
import { ImportVendorModal, VendorProfileModal } from "@/components/crm/VendorProfiles";
import { useModalClose } from "@/lib/useModalClose";
import { formatCurrency } from "@/lib/utils";
import { Toast } from "@/components/crm/Toast";

const tierCls: Record<string, string> = {
  preferred: "bg-brass/15 text-brass",
  featured: "bg-sage/15 text-sage-deep",
  listed: "bg-ink/8 text-ink-soft",
};
const statusCls: Record<string, string> = {
  active: "bg-sage/15 text-sage-deep",
  pending: "bg-brass/15 text-brass",
  review: "bg-terracotta/15 text-terracotta",
};

const CATEGORIES = ["Photography", "Catering", "Florals", "Music", "Planning", "Beauty", "Cake", "Rentals", "Bar Service", "Other"];
const MEMBERSHIP: Record<string, number> = { preferred: 1200, featured: 600, listed: 0 };

export function VendorManager({ initial = seed, live = false }: { initial?: VendorRecord[]; live?: boolean }) {
  const [vendors, setVendors] = useState<VendorRecord[]>(initial);
  const [profiles, setProfiles] = useState<Record<string, VendorProfile>>({});
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [viewing, setViewing] = useState<VendorRecord | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setVendors(live ? initial : [...getAddedVendors(), ...initial]);
    setProfiles(getVendorProfiles()); // profiles are UI enrichment — keep in the browser for now
  }, [initial, live]);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 2600); }

  function addVendor(v: VendorRecord) {
    if (!live) addVendorLocal(v);
    setVendors((list) => [v, ...list]);
    syncToApi("/api/vendors", "POST", v);
    setOpen(false);
    flash("Vendor invited & added to your roster.");
  }

  function saveImported(v: VendorRecord, profile: VendorProfile) {
    if (!live) addVendorLocal(v);
    setVendorProfile(v.id, profile);
    setVendors((list) => [v, ...list]);
    setProfiles((p) => ({ ...p, [v.id]: profile }));
    syncToApi("/api/vendors", "POST", { ...v, profile });
    setImporting(false);
    flash(`${v.name} imported from their website.`);
  }

  function refreshProfile(id: string, profile: VendorProfile) {
    setVendorProfile(id, profile);
    setProfiles((p) => ({ ...p, [id]: { ...p[id], ...profile } }));
    flash("Profile refreshed from their site.");
  }

  const active = vendors.filter((v) => v.status === "active").length;
  const referralRevenue = vendors.reduce((s, v) => s + v.commissionEarnedYTD, 0);
  const membership = vendors.reduce((s, v) => s + v.membershipFee, 0);
  const referrals = vendors.reduce((s, v) => s + v.referralsSent, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Vendor Network</h1>
          <p className="mt-1 text-stone">Your preferred-partner ecosystem — and a referral revenue stream.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setImporting(true)} className="btn btn-primary !py-2.5 !text-xs"><DownloadCloud size={15} /> Import from website</button>
          <button onClick={() => setOpen(true)} className="btn btn-ghost !py-2.5 !text-xs"><Plus size={15} /> Invite manually</button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active partners" value={String(active)} delta="+3" icon={Handshake} accent="ink" />
        <StatCard label="Referral revenue YTD" value={formatCurrency(referralRevenue)} delta="+34%" icon={DollarSign} accent="brass" />
        <StatCard label="Membership revenue" value={formatCurrency(membership)} delta="annual" icon={Award} accent="sage" />
        <StatCard label="Leads sent to vendors" value={String(referrals)} delta="+28" icon={Send} accent="terracotta" />
      </div>

      <Panel title="Partner roster" action={<span className="text-sm text-stone">{vendors.length} partners</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-stone">
              <tr className="border-b border-ink/8">
                <th className="pb-3 font-medium">Vendor</th>
                <th className="pb-3 font-medium">Tier</th>
                <th className="pb-3 font-medium">Referrals → Booked</th>
                <th className="pb-3 font-medium">Commission</th>
                <th className="pb-3 font-medium">Earned YTD</th>
                <th className="pb-3 font-medium">Rating</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {vendors.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-stone">No vendors yet — invite a partner or import one from their website above.</td></tr>
              )}
              {vendors.map((v) => {
                const conv = v.referralsSent ? Math.round((v.bookedFromReferrals / v.referralsSent) * 100) : 0;
                const prof = profiles[v.id];
                return (
                  <tr key={v.id} className="hover:bg-bone/60">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {prof?.logo && <img src={prof.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />}
                        <div><p className="font-medium text-ink">{v.name}</p><p className="text-xs text-stone">{v.category}</p></div>
                      </div>
                    </td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${tierCls[v.tier]}`}>{v.tier}</span></td>
                    <td className="py-3"><p className="text-ink-soft">{v.referralsSent} → {v.bookedFromReferrals}</p>{v.referralsSent > 0 && <p className="text-xs text-sage-deep">{conv}% conversion</p>}</td>
                    <td className="py-3 text-ink-soft">{v.commissionRate}%</td>
                    <td className="py-3 font-medium text-ink">{formatCurrency(v.commissionEarnedYTD)}</td>
                    <td className="py-3">{v.rating > 0 ? <span className="flex items-center gap-1 text-ink-soft"><Star size={13} className="fill-brass text-brass" /> {v.rating.toFixed(1)}</span> : <span className="text-stone">—</span>}</td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusCls[v.status]}`}>{v.status}</span></td>
                    <td className="py-3">
                      <button onClick={() => setViewing(v)} className="flex items-center gap-1.5 rounded-lg bg-bone px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-linen">
                        {prof ? <><Images size={13} className="text-brass" /> View</> : <><Eye size={13} /> Build</>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {open && <VendorModal onClose={() => setOpen(false)} onAdd={addVendor} />}
      {importing && <ImportVendorModal onClose={() => setImporting(false)} onSave={saveImported} />}
      {viewing && <VendorProfileModal vendor={viewing} profile={profiles[viewing.id]} onClose={() => setViewing(null)} onRefresh={refreshProfile} />}

      {toast && (
        <Toast message={toast} />
      )}
    </div>
  );
}

function VendorModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: VendorRecord) => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalClose(onClose, dialogRef);
  const [tier, setTier] = useState<"preferred" | "featured" | "listed">("listed");

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const vendor: VendorRecord = {
      id: newId("V"),
      name: String(fd.get("name") || "New Vendor"),
      category: String(fd.get("category") || "Other"),
      tier,
      status: "pending",
      referralsSent: 0,
      bookedFromReferrals: 0,
      commissionRate: Number(fd.get("commissionRate")) || 0,
      commissionEarnedYTD: 0,
      rating: 0,
      membershipFee: MEMBERSHIP[tier],
    };
    onAdd({ ...vendor, ...( { email: String(fd.get("email") || "") } as object ) });
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" className="w-full max-w-lg rounded-2xl bg-parchment p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Invite a vendor</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Vendor name*" required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-stone">Category*</label>
              <select name="category" required className="rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <Field name="email" label="Contact email" type="email" />
            <Field name="commissionRate" label="Referral commission %" type="number" placeholder="e.g. 10" />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-stone">Partner tier</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["preferred", "featured", "listed"] as const).map((t) => (
                <button type="button" key={t} onClick={() => setTier(t)}
                  className={`rounded-xl px-3 py-2.5 text-center text-sm capitalize transition ${tier === t ? "bg-ink text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>
                  {t}<span className="block text-[0.65rem] opacity-70">{MEMBERSHIP[t] ? `$${MEMBERSHIP[t]}/yr` : "Free"}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 !py-2.5">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1 !py-2.5"><Plus size={15} /> Add Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ name, label, type = "text", required, placeholder }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-stone">{label}</label>
      <input name={name} type={type} required={required} placeholder={placeholder} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage" />
    </div>
  );
}
