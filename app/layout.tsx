import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Great_Vibes } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { business } from "@/lib/content";
import { isPlaceholder } from "@/lib/content-flags";
import { ServiceWorkerRegister } from "@/components/site/ServiceWorkerRegister";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
});

// Canonical site URL for OG images + schema. Auto-detects the production domain
// on Vercel so link previews never point at localhost, even if NEXT_PUBLIC_SITE_URL
// isn't set. Set NEXT_PUBLIC_SITE_URL once a custom domain is live.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://thefarm1893.vercel.app");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${business.name} — ${business.tagline}`,
    template: `%s — ${business.name}`,
  },
  description: business.heroSub,
  openGraph: {
    title: `${business.name} — ${business.tagline}`,
    description: business.heroSub,
    type: "website",
  },
  icons: { icon: "/favicon.svg", apple: "/icon-192.png" },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: business.name },
};

export const viewport: Viewport = {
  themeColor: "#2b2320",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    name: business.name,
    description: business.heroSub,
    address: {
      "@type": "PostalAddress",
      streetAddress: "12316 Berlin Road",
      addressLocality: business.city,
      addressRegion: "OH",
      postalCode: "44814",
      addressCountry: "US",
    },
    telephone: business.phone,
    email: business.email,
    url: SITE_URL,
    sameAs: [business.instagram, business.facebook],
    // Only publish a rating once the testimonials are real — inventing review
    // counts in structured data is a Google policy violation, and it would be
    // reporting reviews that don't exist.
    ...(isPlaceholder("testimonials")
      ? {}
      : { aggregateRating: { "@type": "AggregateRating", ratingValue: "5", reviewCount: "48" } }),
  };

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${greatVibes.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
