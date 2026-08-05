import { Panel } from "@/components/crm/widgets";
import { DemoButton } from "@/components/crm/DemoButton";
import { CalendarConnect } from "@/components/crm/CalendarConnect";
import { GoLiveHealth } from "@/components/crm/GoLiveHealth";
import { ContentToReplace } from "@/components/crm/ContentToReplace";
import { Database, Brain, Phone, CreditCard, Share2, Mail, Check, Plug } from "lucide-react";

export const metadata = { title: "Integrations" };

/** Server component — checks which integrations are wired via env. */
function status(...keys: string[]) {
  return keys.every((k) => Boolean(process.env[k]));
}

const integrations = [
  {
    icon: Database, name: "Supabase", category: "Database & Auth",
    desc: "Stores leads, contacts, bookings, and events. Powers the whole CRM.",
    connected: status("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"),
    keys: "NEXT_PUBLIC_SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY",
  },
  {
    icon: Brain, name: "Anthropic Claude", category: "AI Engine",
    desc: "Powers Rosie, lead scoring, insights, and the Marketing Studio.",
    connected: status("ANTHROPIC_API_KEY"),
    keys: "ANTHROPIC_API_KEY",
  },
  {
    icon: Phone, name: "Twilio", category: "AI Receptionist — Phone",
    desc: "Gives Rosie a real phone number so callers can speak with her 24/7.",
    connected: status("TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"),
    keys: "TWILIO_ACCOUNT_SID · TWILIO_AUTH_TOKEN · TWILIO_PHONE_NUMBER",
  },
  {
    icon: CreditCard, name: "Stripe", category: "Payments",
    desc: "Powers silo-stay checkout and one-tap deposit/balance payment links. Paid checkouts auto-log to the CRM via webhook.",
    connected: status("STRIPE_SECRET_KEY"),
    keys: "STRIPE_SECRET_KEY · STRIPE_WEBHOOK_SECRET",
  },
  {
    icon: Share2, name: "Meta / Instagram", category: "Social Auto-posting",
    desc: "Publish and schedule content from the Marketing Studio.",
    connected: status("META_ACCESS_TOKEN"),
    keys: "META_ACCESS_TOKEN · INSTAGRAM_BUSINESS_ACCOUNT_ID",
  },
  {
    icon: Mail, name: "Resend", category: "Email & Notifications",
    desc: "Auto-welcome sequences, brochures, and instant lead alerts.",
    connected: status("RESEND_API_KEY"),
    keys: "RESEND_API_KEY",
  },
];

export default function SettingsPage() {
  const live = integrations.filter((i) => i.connected).length;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Integrations</h1>
        <p className="mt-1 text-stone">
          Everything is pluggable. {live} of {integrations.length} connected — the rest run in smart demo mode until you add a key.
        </p>
      </div>

      <div className="rounded-2xl border border-sage/30 bg-sage/8 p-5 text-sm text-ink-soft">
        <div className="flex items-center gap-2 font-medium text-ink"><Plug size={16} className="text-sage-deep" /> How this works</div>
        <p className="mt-1.5">
          Add each service's keys to your <code className="rounded bg-white px-1.5 py-0.5 text-xs">.env.local</code> file
          (see <code className="rounded bg-white px-1.5 py-0.5 text-xs">.env.example</code>). The app detects them automatically and
          flips the feature from demo mode to live — no code changes needed.
        </p>
      </div>

      {/* Live database truth + the last placeholder content */}
      <div className="grid gap-6 xl:grid-cols-2">
        <GoLiveHealth />
        <ContentToReplace />
      </div>

      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((it) => (
            <div key={it.name} className="rounded-xl border border-ink/8 bg-bone p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-parchment"><it.icon size={20} /></div>
                  <div>
                    <p className="font-medium text-ink">{it.name}</p>
                    <p className="text-xs text-stone">{it.category}</p>
                  </div>
                </div>
                {it.connected ? (
                  <span className="flex items-center gap-1 rounded-full bg-sage/15 px-2.5 py-1 text-xs font-medium text-sage-deep"><Check size={13} /> Connected</span>
                ) : (
                  <span className="rounded-full bg-ink/8 px-2.5 py-1 text-xs font-medium text-stone">Demo mode</span>
                )}
              </div>
              <p className="mt-3 text-sm text-ink-soft">{it.desc}</p>
              <p className="mt-3 font-mono text-[0.68rem] text-stone">{it.keys}</p>
              {!it.connected && (
                <DemoButton className="btn btn-ghost mt-4 !py-2 !text-xs" toast={`Add ${it.name}'s keys in Vercel → Environment Variables, then redeploy to connect.`}>Connect {it.name}</DemoButton>
              )}
            </div>
          ))}
        </div>
      </Panel>

      <CalendarConnect />
    </div>
  );
}
