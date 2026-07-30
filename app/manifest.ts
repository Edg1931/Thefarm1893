import type { MetadataRoute } from "next";
import { business } from "@/lib/content";

/** PWA manifest — makes the site installable to a phone home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${business.name} — Venue OS`,
    short_name: business.name,
    description: business.heroSub,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#2b2320",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
