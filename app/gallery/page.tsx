import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { gallery } from "@/lib/content";

export const metadata = { title: "Gallery" };

export default function GalleryPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Gallery"
        script="picture yourself here"
        title="Moments made at the farm"
        image="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2100&q=80"
      />
      <section className="bg-bone py-20 md:py-28">
        <div className="container-x">
          <GalleryGrid images={gallery} />
          <Reveal className="mt-16 text-center">
            <p className="font-script text-3xl text-brass">Your story could be next</p>
            <Link href="/contact" className="btn btn-primary mt-5">Book a Tour <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
