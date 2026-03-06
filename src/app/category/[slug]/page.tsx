import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import { ProductCard } from "@/components/ProductCard";
import type { ProductForCard } from "@/types/product";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    notFound();
  }
  const supabase = supabaseServer;

  const { data: category } = await supabase
    .from("product_categories")
    .select("id, slug, name")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, category, image_url, default_price")
    .eq("category", slug)
    .eq("is_published", true);

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, product_id, size, quantity");

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
      imageUrl: p.image_url,
      defaultPrice: Number(p.default_price),
      variants: vars,
      totalStock,
    };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">{category.name}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-muted-foreground">
          Aucun produit publié dans cette catégorie.
        </p>
      )}
    </div>
  );
}
