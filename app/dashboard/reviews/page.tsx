import { ReviewBoard } from "@/components/crm/ReviewBoard";
import { getReviews } from "@/lib/crm/data";
import { DemoBanner } from "@/components/crm/DemoBanner";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const { reviews, summary, live } = await getReviews();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Reviews</h1>
        <p className="mt-1 text-stone">Every review from Google, Airbnb, VRBO, and Facebook in one place — and one-tap requests to grow them.</p>
      </div>
      <DemoBanner live={live} empty={reviews.length === 0} what="reviews" />
      <ReviewBoard reviews={reviews} summary={summary} />
    </div>
  );
}
