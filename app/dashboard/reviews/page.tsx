import { ReviewBoard } from "@/components/crm/ReviewBoard";
import { getReviews } from "@/lib/crm/data";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const { reviews, summary } = await getReviews();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Reviews</h1>
        <p className="mt-1 text-stone">Every review from Google, Airbnb, VRBO, and Facebook in one place — and one-tap requests to grow them.</p>
      </div>
      <ReviewBoard reviews={reviews} summary={summary} />
    </div>
  );
}
