/** App-wide constants – single source for magic strings and paths */

export const STORAGE_KEYS = {
  ANNOUNCEMENT_DISMISSED: "storefront-announcement-dismissed",
  CART: "storefront-cart",
} as const;

export const PATHS = {
  HERO_BANNER: "/herobanner.jpg",
} as const;

/** Main shop sections (Homme / Femme / Enfant) */
export const MAIN_CATEGORIES = [
  { slug: "homme" as const, label: "Homme" },
  { slug: "femme" as const, label: "Femme" },
  { slug: "enfant" as const, label: "Enfant" },
] as const;

export type MainCategorySlug = (typeof MAIN_CATEGORIES)[number]["slug"];

/** Default category card images (no faces, no bodies – used when no product image) */
export const DEFAULT_CATEGORY_IMAGES: Record<MainCategorySlug, string> = {
  homme: "/category-homme.jpg",
  femme: "/category-femme.jpg",
  enfant: "/category-enfant.jpg",
};

/** Colors for shop filter (match product color field) */
export const FILTER_COLORS = [
  "Noir",
  "Blanc",
  "Bleu",
  "Rouge",
  "Vert",
  "Gris",
  "Marron",
  "Beige",
  "Jaune",
  "Rose",
  "Autre",
] as const;
