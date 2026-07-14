import type { MetadataRoute } from "next";
import { posts } from "@/lib/journal";
import { realWeddings } from "@/lib/real-weddings";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://thefarm1893.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", "/venue", "/weddings", "/gatherings", "/accommodations", "/stay",
    "/design-my-day", "/quiz", "/gallery", "/real-weddings", "/vendors",
    "/journal", "/refer", "/pricing", "/about", "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const journal = posts.map((p) => ({
    url: `${base}/journal/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const weddings = realWeddings.map((w) => ({
    url: `${base}/real-weddings/${w.slug}`,
    lastModified: new Date(w.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...journal, ...weddings];
}
