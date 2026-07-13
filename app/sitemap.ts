import type { MetadataRoute } from "next";
import { posts } from "@/lib/journal";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://thefarm1893.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "", "/venue", "/weddings", "/gatherings", "/accommodations", "/stay",
    "/design-my-day", "/gallery", "/vendors", "/journal", "/pricing",
    "/about", "/contact",
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

  return [...routes, ...journal];
}
