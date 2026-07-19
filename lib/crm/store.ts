/* ============================================================================
   CLIENT-SIDE CRM STORE (demo persistence)
   Until Supabase is connected, added/edited records persist in the browser so
   the CRM is fully usable in demos. The matching /api routes write to the real
   database the moment it's configured — same shapes, no rework.
   ============================================================================ */

import type { Lead, VendorRecord, VendorProfile } from "./sample-data";
import type { VendorAssignment, Payment, ChecklistItem } from "./bookings";

const K = {
  vendors: "farm1893:vendorsAdded",
  contactsAdded: "farm1893:contactsAdded",
  contactOverrides: "farm1893:contactOverrides",
  dossierOverrides: "farm1893:dossierOverrides",
  vendorProfiles: "farm1893:vendorProfiles",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch { /* ignore quota/private-mode errors */ }
}

/* --- Vendors --- */
export const getAddedVendors = (): VendorRecord[] => read(K.vendors, []);
export function addVendorLocal(v: VendorRecord) {
  write(K.vendors, [v, ...getAddedVendors()]);
}

/* --- Contacts (added) --- */
export const getAddedContacts = (): Lead[] => read(K.contactsAdded, []);
export function addContactLocal(c: Lead) {
  write(K.contactsAdded, [c, ...getAddedContacts()]);
}

/* --- Contacts (edits to existing/sample records) --- */
export const getContactOverrides = (): Record<string, Partial<Lead>> => read(K.contactOverrides, {});
export function setContactOverride(id: string, patch: Partial<Lead>) {
  const all = getContactOverrides();
  all[id] = { ...all[id], ...patch };
  write(K.contactOverrides, all);
}
export function applyOverride<T extends { id: string }>(record: T): T {
  const patch = getContactOverrides()[record.id];
  return patch ? { ...record, ...patch } : record;
}

/* --- Vendor mini-profiles (auto-scraped from their websites) --- */
export const getVendorProfiles = (): Record<string, VendorProfile> => read(K.vendorProfiles, {});
export const getVendorProfile = (id: string): VendorProfile | undefined => getVendorProfiles()[id];
export function setVendorProfile(id: string, profile: VendorProfile) {
  const all = getVendorProfiles();
  all[id] = { ...all[id], ...profile };
  write(K.vendorProfiles, all);
}

/* --- Dossier edits (vendor team, payments, checklist per client) --- */
export type DossierPatch = {
  vendors?: VendorAssignment[];
  payments?: Payment[];
  checklist?: ChecklistItem[];
  coordinator?: string;
  package?: string;
};
export const getDossierOverrides = (): Record<string, DossierPatch> => read(K.dossierOverrides, {});
export function getDossierOverride(leadId: string): DossierPatch | undefined {
  return getDossierOverrides()[leadId];
}
export function setDossierOverride(leadId: string, patch: DossierPatch) {
  const all = getDossierOverrides();
  all[leadId] = { ...all[leadId], ...patch };
  write(K.dossierOverrides, all);
}

/** Fire-and-forget sync to the API (writes to Supabase when configured). */
export function syncToApi(path: string, method: "POST" | "PATCH", body: unknown) {
  try {
    void fetch(path, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch { /* demo mode — localStorage is the source of truth */ }
}

export function newId(prefix: string) {
  // App-runtime only (not the workflow sandbox), so Date.now is available.
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}
