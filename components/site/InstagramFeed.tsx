import Image from "next/image";
import { Instagram, Heart } from "lucide-react";
import { business } from "@/lib/content";

/* Pluggable: swap `posts` for a live pull from the Instagram Graph API when
   META_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID are configured. */
const posts = [
  { img: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80", likes: 428 },
  { img: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80", likes: 511 },
  { img: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=600&q=80", likes: 376 },
  { img: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=600&q=80", likes: 642 },
  { img: "https://images.unsplash.com/photo-1470259078422-826894b933ad?auto=format&fit=crop&w=600&q=80", likes: 289 },
  { img: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=600&q=80", likes: 503 },
];

export function InstagramFeed() {
  return (
    <section className="bg-parchment py-20 md:py-24">
      <div className="container-x">
        <div className="text-center">
          <p className="eyebrow">Follow along</p>
          <a href={business.instagram} className="mt-3 inline-flex items-center gap-2 font-display text-4xl text-ink transition hover:text-brass md:text-5xl">
            <Instagram size={30} /> @thefarm1893
          </a>
          <p className="mt-3 text-ink-soft">Real moments from the orchard, the barn, and the bonfire.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
          {posts.map((p, i) => (
            <a key={i} href={business.instagram} className="group relative aspect-square overflow-hidden rounded-lg" aria-label="View on Instagram">
              <Image src={p.img} alt="Instagram post" fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="(max-width:768px) 50vw, 16vw" />
              <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink/0 text-parchment opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
                <Heart size={16} className="fill-current" /> {p.likes}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
