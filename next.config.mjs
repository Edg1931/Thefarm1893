/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  /**
   * "The Stay" and "Retreats" both described the same farmhouse and have been
   * merged into /silos, which now covers all lodging. These are permanent (308)
   * so the pages keep whatever ranking and inbound links they had rather than
   * dropping to 404 — both were in the sitemap, so search engines know them.
   */
  async redirects() {
    return [
      { source: "/accommodations", destination: "/silos#farmhouse", permanent: true },
      { source: "/stay", destination: "/silos#farmhouse", permanent: true },
    ];
  },
};

export default nextConfig;
