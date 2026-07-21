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
  if (!p) return { title: "Journal" };
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    keywords: p.keywords,
    alternates: { canonical: `/journal/${p.slug}` },
    openGraph: {
      title: p.metaTitle,
      description: p.metaDescription,
      type: "article",
      publishedTime: p.date,
      modifiedTime: p.updated ?? p.date,
      images: [p.cover],
    },
  };
}

/** Render inline [label](/path) links inside article text. */
function renderText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <Link key={`l${key++}`} href={m[2]} className="font-medium text-brass underline underline-offset-2 hover:text-brass-soft">{m[1]}</Link>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const more = posts.filter((p) => p.slug !== slug).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    image: post.cover,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { "@type": "Organization", name: post.author },
    publisher: { "@type": "Organization", name: "The Farm 1893" },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
    mainEntityOfPage: `/journal/${post.slug}`,
  };

  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <article>
        <div className="relative flex min-h-[58vh] items-end overflow-hidden pt-24">
          <Image src={post.cover} alt={post.title} fill priority className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
          <div className="container-x relative z-10 pb-12 text-parchment">
            <p className="eyebrow !text-brass-soft">{post.category} · {post.readMins} min read</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight md:text-6xl">{post.title}</h1>
            <p className="mt-4 text-sm text-parchment/70">By {post.author} · {formatDate(post.date)}{post.updated ? ` · Updated ${formatDate(post.updated)}` : ""}</p>
          </div>
        </div>

        {/* Body */}
        <div className="bg-bone py-16 md:py-24">
          <div className="container-x max-w-2xl">
            <Link href="/journal" className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink"><ArrowLeft size={15} /> All stories</Link>
            <div className="mt-8 space-y-6">
              <p className="font-display text-2xl leading-relaxed text-ink">{post.excerpt}</p>
              {post.content.map((b, i) => {
                if (b.type === "h2") return <h2 key={i} className="pt-4 font-display text-3xl text-ink">{b.text}</h2>;
                if (b.type === "list") return (
                  <ul key={i} className="list-disc space-y-2 pl-5 text-lg leading-relaxed text-ink-soft marker:text-brass">
                    {b.items.map((it, j) => <li key={j}>{renderText(it)}</li>)}
                  </ul>
                );
                return <p key={i} className="text-lg leading-relaxed text-ink-soft">{renderText(b.text)}</p>;
              })}
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
