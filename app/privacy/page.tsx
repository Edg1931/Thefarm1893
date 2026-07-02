import { SiteShell } from "@/components/site/SiteShell";
import { business } from "@/lib/content";

export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <SiteShell>
      <section className="bg-bone pt-36 pb-24">
        <div className="container-x max-w-3xl">
          <h1 className="font-display text-5xl text-ink">Privacy Policy</h1>
          <p className="mt-6 leading-relaxed text-ink-soft">
            {business.name} respects your privacy. When you submit an inquiry or chat with
            our AI concierge, we collect only the details needed to help plan your event —
            such as your name, contact information, and event preferences.
          </p>
          <p className="mt-4 leading-relaxed text-ink-soft">
            We never sell your information. We use it solely to respond to your inquiry,
            provide availability and pricing, and follow up about your celebration. You may
            request deletion of your data at any time by emailing{" "}
            <a href={`mailto:${business.email}`} className="text-brass underline">{business.email}</a>.
          </p>
          <p className="mt-8 text-sm text-stone">
            This is placeholder policy copy — replace with your finalized legal text before launch.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
