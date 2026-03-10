import { notFound } from "next/navigation";
import { getSupabaseReader } from "@/lib/supabaseServer";
import { getMainCategories } from "@/lib/mainCategories";
import { ShopPageContent } from "@/components/ShopPageContent";
import type { ProductForCard } from "@/types/product";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ gender: string }> };

export default async function ShopGenderPage({ params }: Props) {
  const { gender } = await params;
  const mainCategories = await getMainCategories();
  const validGenders = new Set(mainCategories.map((c) => c.slug));
  if (!validGenders.has(gender)) {
    notFound();
  }
  const supabase = getSupabaseReader();
  if (!supabase) notFound();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, color, image_url, default_price")
    .eq("main_category", gender)
    .eq("is_published", true);

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, product_id, size, quantity");

  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, slug, name");

  const variantsByProduct: Record<
    string,
    { id: string; size: string; quantity: number }[]
  > = {};
  variants?.forEach((v) => {
    if (!variantsByProduct[v.product_id]) variantsByProduct[v.product_id] = [];
    variantsByProduct[v.product_id].push({
      id: v.id,
      size: v.size,
      quantity: v.quantity ?? 0,
    });
  });

  const list: ProductForCard[] = (products ?? []).map((p) => {
    const vars = variantsByProduct[p.id] ?? [];
    const totalStock = vars.reduce((s, v) => s + v.quantity, 0);
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      color: (p as { color?: string | null }).color ?? null,
      imageUrl: p.image_url,
      defaultPrice: Number(p.default_price),
      variants: vars,
      totalStock,
    };
  });

  const categoryOptions = (categories ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
  }));

  const genderLabel =
    mainCategories.find((c) => c.slug === gender)?.label ?? gender;

  return (
    <ShopPageContent
      gender={gender}
      genderLabel={genderLabel}
      initialProducts={list}
      categoryOptions={categoryOptions}
    />
  );
}
