import Link from "next/link";
import { WifiOff } from "lucide-react";
import { business } from "@/lib/content";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="grid min-h-screen place-items-center bg-bone px-6 text-center">
      <div>
        <WifiOff className="mx-auto text-brass" size={40} />
        <h1 className="mt-4 font-display text-4xl text-ink">You&apos;re offline</h1>
        <p className="mt-2 text-stone">It looks like you&apos;ve lost your connection. Pages you&apos;ve visited are still available — reconnect to see the latest.</p>
        <Link href="/" className="btn btn-primary mt-6">Back to {business.name}</Link>
      </div>
    </div>
  );
}
