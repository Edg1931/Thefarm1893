import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { getPost, posts } from "@/lib/journal";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPost(slug);
  return p
    ? { title: p.title, description: p.excerpt, openGraph: { title: p.title, description: p.excerpt, images: [p.cover] } }
    : { title: "Journal" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const more = posts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <SiteShell>
      {/* Hero */}
      <article>
        <div className="relative flex min-h-[58vh] items-end overflow-hidden pt-24">
          <Image src={post.cover} alt={post.title} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
          <div className="container-x relative z-10 pb-12 text-parchment">
            <p className="eyebrow !text-brass-soft">{post.category} · {post.readMins} min read</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-6xl">{post.title}</h1>
            <p className="mt-4 text-sm text-parchment/70">{formatDate(post.date)}</p>
          </div>
        </div>

        {/* Body */}
        <div className="bg-bone py-16 md:py-24">
          <div className="container-x max-w-2xl">
            <Link href="/journal" className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink"><ArrowLeft size={15} /> All stories</Link>
            <div className="mt-8 space-y-6">
              <p className="font-display text-2xl leading-relaxed text-ink">{post.excerpt}</p>
              {post.body.map((para, i) => (
                <p key={i} className="text-lg leading-relaxed text-ink-soft">{para}</p>
              ))}
            </div>

            <div className="mt-12 rounded-2xl bg-[color:var(--color-ink)] p-8 text-center text-parchment">
              <p className="font-script text-3xl text-brass-soft">ready to see it in person?</p>
              <h3 className="mt-2 font-display text-3xl">Come tour the farm</h3>
              <Link href="/contact" className="btn bg-parchment text-ink mt-5">Book a Private Tour <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </article>

      {/* More */}
      <section className="bg-[color:var(--color-linen)] py-16 md:py-24">
        <div className="container-x">
          <Reveal><h2 className="font-display text-3xl text-ink">Keep reading</h2></Reveal>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {more.map((p) => (
              <Reveal key={p.slug}>
                <Link href={`/journal/${p.slug}`} className="card-hover group flex overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)]">
                  <div className="relative w-40 shrink-0 overflow-hidden">
                    <Image src={p.cover} alt={p.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="160px" />
                  </div>
                  <div className="p-5">
                    <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-stone"><Clock size={11} /> {p.readMins} min</span>
                    <h3 className="mt-2 font-display text-xl text-ink">{p.title}</h3>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
