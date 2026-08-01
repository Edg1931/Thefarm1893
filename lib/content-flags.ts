/* ============================================================================
   CONTENT FLAGS — small helpers around `contentStatus` in lib/content.ts.

   Purpose: nothing fake should be able to reach a real guest by accident. While
   a piece of content is flagged "placeholder", the UI degrades honestly instead
   of pretending — e.g. the sample phone number is shown as plain text rather
   than a `tel:` link that dials a dead line, and we don't publish invented
   review counts in structured data.

   Flip the entry in `contentStatus` to "real" and the guard disappears — no
   other code changes required.
   ============================================================================ */

import { business, contentStatus, type ContentKey } from "./content";

export const isPlaceholder = (key: ContentKey): boolean => contentStatus[key] === "placeholder";
export const isReal = (key: ContentKey): boolean => contentStatus[key] === "real";

/** Every item still needing real content, for the dashboard checklist. */
export const pendingContent = (): ContentKey[] =>
  (Object.keys(contentStatus) as ContentKey[]).filter(isPlaceholder);

/**
 * How to render the phone number.
 * - real        → `{ href }` set, safe to render as a tap-to-call link.
 * - placeholder → `{ href: null }`; render the digits as plain text so nobody
 *                 taps a number that goes nowhere.
 */
export function phoneDisplay(): { text: string; href: string | null; placeholder: boolean } {
  const placeholder = isPlaceholder("phone");
  return {
    text: business.phone,
    href: placeholder ? null : business.phoneHref,
    placeholder,
  };
}

/** Human-readable guidance shown in the dashboard for each flagged item. */
export const CONTENT_GUIDANCE: Record<ContentKey, { label: string; why: string; where: string }> = {
  phone: {
    label: "Real phone number",
    why: "(419) 555-1893 is a reserved fake number — tap-to-call is disabled until this is real.",
    where: "lib/content.ts → business.phone + business.phoneHref",
  },
  pricing: {
    label: "Real pricing",
    why: "Package prices are illustrative. Couples treat these as a quote.",
    where: "lib/content.ts → packages",
  },
  testimonials: {
    label: "Real testimonials",
    why: "Sample quotes are indistinguishable from real ones, and the star rating is kept out of Google's structured data until they're genuine.",
    where: "lib/content.ts → testimonials",
  },
  photos: {
    label: "Real photography",
    why: "Stock imagery is the biggest conversion drag on a venue site.",
    where: "Supabase Storage → Photos bucket",
  },
};
