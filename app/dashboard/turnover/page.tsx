import { TurnoverBoard } from "@/components/crm/TurnoverBoard";
import { getTurnovers } from "@/lib/crm/data";

export const metadata = { title: "Turnover & Cleaning" };

export default async function TurnoverPage() {
  const { turnovers, live } = await getTurnovers();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Turnover &amp; cleaning</h1>
        <p className="mt-1 max-w-2xl text-stone">
          Every clean timed against its benchmark, photographed before and after, and priced —
          so &ldquo;what does a turnover actually cost?&rdquo; is a number you can quote, and
          hiring a crew becomes a comparison instead of a guess.
        </p>
      </div>
      <TurnoverBoard initial={turnovers} live={live} />
    </div>
  );
}
