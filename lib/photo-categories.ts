/* ============================================================================
   PHOTO CATEGORIES — the taxonomy that maps site sections + marketing to the
   Supabase Storage `Photos` bucket folders. Add photos by dropping them in the
   matching folder (optionally split into inside/ and outside/ subfolders for
   sharper AI marketing targeting).
   ============================================================================ */

export type ShowcaseCategory = {
  key: string;
  label: string;
  folder: string;   // top-level folder in the Photos bucket
  blurb: string;
  href: string;
};

/** The three areas featured on the homepage "Explore the Farm" showcase. */
export const showcaseCategories: ShowcaseCategory[] = [
  {
    key: "venue",
    label: "The Venue",
    folder: "venue",
    blurb: "The barn, the orchard, the ceremony lawn — where your day unfolds.",
    href: "/venue",
  },
  {
    key: "bridal-prep",
    label: "Bridal Prep",
    folder: "bridal-prep",
    blurb: "Bright getting-ready suites made for mimosas, robes, and the calm before.",
    href: "/venue",
  },
  {
    key: "silos",
    label: "Overnight Stays",
    folder: "silos",
    blurb: "Four restored silos to keep your favorite people on the farm all weekend.",
    href: "/silos",
  },
];

/**
 * Folders offered in the marketing photo picker. `deep: true` aggregates
 * inside/ + outside/ (and per-silo) subfolders so the whole area is browsable.
 */
export type PhotoSource = { label: string; folder: string; deep?: boolean };
export const marketingPhotoSources: PhotoSource[] = [
  { label: "Hero / venue banners", folder: "hero" },
  { label: "Gallery", folder: "gallery" },
  { label: "Venue", folder: "venue", deep: true },
  { label: "Venue · inside", folder: "venue/inside" },
  { label: "Venue · outside", folder: "venue/outside" },
  { label: "Bridal prep", folder: "bridal-prep", deep: true },
  { label: "Bridal prep · inside", folder: "bridal-prep/inside" },
  { label: "Bridal prep · outside", folder: "bridal-prep/outside" },
  { label: "Silos (all)", folder: "silos", deep: true },
  { label: "The Orchard Silo", folder: "silos/the-orchard-silo" },
  { label: "The Harvest Silo", folder: "silos/the-harvest-silo" },
  { label: "The Copper Silo", folder: "silos/the-copper-silo" },
  { label: "The Meadow Silo", folder: "silos/the-meadow-silo" },
];
