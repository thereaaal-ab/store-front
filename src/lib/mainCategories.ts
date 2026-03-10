import { getSupabaseReader } from "@/lib/supabaseServer";
import { MAIN_CATEGORIES } from "@/constants";

export type MainCategoryItem = { slug: string; label: string; imageUrl?: string | null };

/**
 * Fetches main categories from DB (same table as backoffice).
 * Deletions in the backoffice are reflected here on next page load.
 * Falls back to MAIN_CATEGORIES constant only when Supabase is unavailable or query errors.
 */
export async function getMainCategories(): Promise<MainCategoryItem[]> {
  const supabase = getSupabaseReader();
  if (!supabase) return [...MAIN_CATEGORIES];

  const { data, error } = await supabase
    .from("main_categories")
    .select("slug, label, image_url")
    .order("position", { ascending: true })
    .order("slug", { ascending: true });

  if (error) return [...MAIN_CATEGORIES];
  if (!data?.length) return [];
  return data.map((row) => ({
    slug: row.slug,
    label: row.label,
    imageUrl: (row as { image_url?: string | null }).image_url ?? null,
  }));
}
