import Link from "next/link";
import { notFound } from "next/navigation";
import { Gift } from "lucide-react";
import { getRegistry } from "@/lib/crm/registry";
import { RegistryBoard } from "@/components/RegistryBoard";
import { Logo } from "@/components/site/Logo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = getRegistry(slug);
  return { title: r ? `${r.coupleName} · Registry` : "Registry", robots: { index: false, follow: false } };
}

export default async function RegistryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const registry = getRegistry(slug);
  if (!registry) notFound();

  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-ink/10 bg-parchment">
        <div className="container-x flex items-center justify-between py-4">
          <Logo />
          <Link href={`/celebration/${slug}`} className="text-sm text-stone hover:text-ink">← Back to guest site</Link>
        </div>
      </header>

      <section className="bg-[color:var(--color-ink)] py-16 text-center text-parchment md:py-20">
        <div className="container-x max-w-2xl">
          <Gift className="mx-auto text-brass-soft" size={34} />
          <p className="mt-4 font-script text-4xl text-brass-soft">with love & gratitude</p>
          <h1 className="mt-1 font-display text-5xl md:text-6xl">{registry.coupleName}'s Registry</h1>
          <p className="mx-auto mt-5 text-parchment/75">{registry.intro}</p>
        </div>
      </section>

      <main className="container-x py-14 md:py-20">
        <RegistryBoard funds={registry.funds} />
      </main>
    </div>
  );
}
