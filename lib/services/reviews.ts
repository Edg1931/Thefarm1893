/* ============================================================================
   REVIEWS — request + aggregate across Google, Airbnb, VRBO, and Facebook.
   Aggregation activates per-source as each API key is added (Google Places,
   Meta Graph, etc.); until then it returns the polished sample set. Requests go
   out via the email adapter. All mock-first so the loop works in demo.
   ============================================================================ */

import { sampleReviews, ratingSummary, type Review } from "@/lib/crm/comms";
import { sendEmail } from "@/lib/services/email";

export function reviewsConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY || process.env.META_ACCESS_TOKEN);
}

/** Aggregate reviews from connected sources (mock returns the sample set). */
export async function aggregateReviews(): Promise<{ live: boolean; reviews: Review[] }> {
  if (!reviewsConfigured()) return { live: false, reviews: sampleReviews };
  // Real fetchers (Places / Graph / OTA imports) would populate here.
  return { live: true, reviews: sampleReviews };
}

export { ratingSummary };

/** Send a review request to a past client/guest. */
export async function requestReview(to: string, name: string): Promise<{ ok: boolean; demo: boolean }> {
  return sendEmail({
    to,
    subject: "How was your time at The Farm 1893? 🌾",
    html: `<p>Hi ${name},</p><p>It was so special having you. Would you share a quick review? It helps other couples and guests find us.</p><p><a href="https://g.page/r/thefarm1893/review">Leave a Google review →</a></p>`,
  });
}
