import { Wifi, KeyRound, Clock, MapPin, Phone, DoorOpen } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
import { CheckinComplete } from "@/components/site/CheckinComplete";
import { verifyToken } from "@/lib/services/portal-auth";
import { business } from "@/lib/content";

export const metadata = { title: "Self Check-In", robots: { index: false } };

const guidebook = {
  wifi: { network: "Farm1893-Guest", password: "orchard-moon-1893" },
  doorCode: "1893#",
  checkIn: "4:00 PM",
  checkOut: "11:00 AM",
  parking: "Gravel lot beside the silos — park anywhere marked GUEST.",
  checkoutSteps: [
    "Start the dishwasher and bag any trash by the back door.",
    "Turn the thermostat to 65° and switch off the lights.",
    "Pull the door firmly shut — it locks automatically.",
  ],
};

export default async function CheckinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const payload = token === "demo" ? { id: "demo-stay", scope: "checkin" as const } : verifyToken(token);
  const valid = Boolean(payload && payload.scope === "checkin");

  if (!valid) {
    return (
      <PortalShell title="Check-in link expired" subtitle="Let's get you a fresh one.">
        <div className="rounded-2xl border border-ink/8 bg-parchment p-8 text-center">
          <DoorOpen className="mx-auto text-brass" />
          <p className="mt-3 text-ink-soft">This self check-in link is invalid or has expired. Please reach out and we&apos;ll send a new one right away.</p>
          <a href={business.phoneHref} className="btn btn-primary mt-5"><Phone size={16} /> Call the Farm</a>
        </div>
      </PortalShell>
    );
  }

  const isDemo = token === "demo";
  return (
    <PortalShell title="Welcome to the Farm" subtitle="Everything you need for a smooth arrival.">
      {isDemo && (
        <div className="mb-6 rounded-xl bg-brass/12 px-4 py-2.5 text-sm text-ink ring-1 ring-brass/25">Demo guidebook — real links carry your booking&apos;s own unique door code &amp; Wi-Fi.</div>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Real bookings get their unique credentials by text; only the demo link shows sample codes. */}
        <Card icon={KeyRound} title="Door code" value={isDemo ? guidebook.doorCode : "Texted on arrival day"} note={isDemo ? "Same code all weekend. The keypad is to the right of the door." : "We'll send your private keypad code the morning you arrive."} />
        <Card icon={Wifi} title="Wi-Fi" value={isDemo ? guidebook.wifi.network : "In your welcome text"} note={isDemo ? `Password: ${guidebook.wifi.password}` : "Your network name & password arrive with your door code."} />
        <Card icon={Clock} title="Check-in / out" value={`${guidebook.checkIn} → ${guidebook.checkOut}`} note="Early arrival? Message us and we'll try to accommodate." />
        <Card icon={MapPin} title="Parking" value="Guest lot by the silos" note={guidebook.parking} />
      </div>

      <section className="mt-6 rounded-2xl border border-ink/8 bg-parchment p-6">
        <h2 className="font-display text-2xl text-ink">Before you leave</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-soft marker:text-brass">
          {guidebook.checkoutSteps.map((s, i) => <li key={i}>{s}</li>)}
        </ol>
      </section>

      <div className="mt-8 flex justify-center">
        <CheckinComplete token={token} />
      </div>
    </PortalShell>
  );
}

function Card({ icon: Icon, title, value, note }: { icon: typeof Wifi; title: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl border border-ink/8 bg-parchment p-6">
      <p className="flex items-center gap-2 text-sm text-brass"><Icon size={16} /> {title}</p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      <p className="mt-1 text-sm text-stone">{note}</p>
    </div>
  );
}
