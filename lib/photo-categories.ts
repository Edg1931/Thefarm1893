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
 * Folders offered in the marketing photo picker, grouped for a tidy dropdown.
 * `deep: true` aggregates inside/ + outside/ (and per-silo) subfolders so the
 * whole area is browsable; the explicit Inside/Outside rows target one or the other.
 */
export type PhotoSource = { label: string; folder: string; deep?: boolean; group: string };
export const marketingPhotoSources: PhotoSource[] = [
  { group: "General", label: "Hero / banners", folder: "hero" },
  { group: "General", label: "Gallery", folder: "gallery" },

  { group: "Venue", label: "Venue — all", folder: "venue", deep: true },
  { group: "Venue", label: "Venue — inside", folder: "venue/inside" },
  { group: "Venue", label: "Venue — outside", folder: "venue/outside" },

  { group: "Bridal prep", label: "Bridal prep — all", folder: "bridal-prep", deep: true },
  { group: "Bridal prep", label: "Bridal prep — inside", folder: "bridal-prep/inside" },
  { group: "Bridal prep", label: "Bridal prep — outside", folder: "bridal-prep/outside" },

  { group: "Silos", label: "All silos", folder: "silos", deep: true },
  { group: "Silos", label: "Orchard — all", folder: "silos/the-orchard-silo", deep: true },
  { group: "Silos", label: "Orchard — inside", folder: "silos/the-orchard-silo/inside" },
  { group: "Silos", label: "Orchard — outside", folder: "silos/the-orchard-silo/outside" },
  { group: "Silos", label: "Harvest — all", folder: "silos/the-harvest-silo", deep: true },
  { group: "Silos", label: "Copper — all", folder: "silos/the-copper-silo", deep: true },
  { group: "Silos", label: "Meadow — all", folder: "silos/the-meadow-silo", deep: true },
];

/** Distinct group names in order, for rendering <optgroup>s. */
export const marketingPhotoGroups = [...new Set(marketingPhotoSources.map((s) => s.group))];
