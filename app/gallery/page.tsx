import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { InstagramFeed } from "@/components/site/InstagramFeed";
import { gallery as galleryFallback } from "@/lib/content";
import { photosOr, heroOr } from "@/lib/images";

export const metadata = { title: "Gallery" };
export const revalidate = 3600; // refresh from Storage hourly (no redeploy needed)

export default async function GalleryPage() {
  const [images, heroImage] = await Promise.all([
    photosOr("gallery", galleryFallback),
    heroOr("hero", "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2100&q=80"),
  ]);
  return (
    <SiteShell>
      <PageHero
        eyebrow="Gallery"
        script="picture yourself here"
        title="Moments made at the farm"
        image={heroImage}
      />
      <section className="bg-bone py-20 md:py-28">
        <div className="container-x">
          <GalleryGrid images={images} />
          <Reveal className="mt-16 text-center">
            <p className="font-script text-3xl text-brass">Your story could be next</p>
            <Link href="/contact" className="btn btn-primary mt-5">Book a Tour <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>
      <InstagramFeed />
    </SiteShell>
  );
}
