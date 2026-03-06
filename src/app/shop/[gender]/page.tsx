import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { ShopPageContent } from "@/components/ShopPageContent";
import type { ProductForCard } from "@/types/product";
import { MAIN_CATEGORIES } from "@/constants";

export const dynamic = "force-dynamic";

const VALID_GENDERS = new Set(MAIN_CATEGORIES.map((c) => c.slug));

type Props = { params: Promise<{ gender: string }> };

export default async function ShopGenderPage({ params }: Props) {
  const { gender } = await params;
  if (!VALID_GENDERS.has(gender as "homme" | "femme" | "enfant")) {
    notFound();
  }
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    notFound();
  }

  const supabase = supabaseServer;
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
    MAIN_CATEGORIES.find((c) => c.slug === gender)?.label ?? gender;

  return (
    <ShopPageContent
      gender={gender}
      genderLabel={genderLabel}
      initialProducts={list}
      categoryOptions={categoryOptions}
    />
  );
}
