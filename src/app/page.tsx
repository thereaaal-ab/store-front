import { supabaseServer } from "@/lib/supabaseServer";
import { Hero } from "@/components/Hero";
import { GenderCard } from "@/components/GenderCard";
import { MAIN_CATEGORIES, DEFAULT_CATEGORY_IMAGES } from "@/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return (
      <div className="space-y-6 py-12">
        <h1 className="font-display text-2xl font-medium text-gray-900">
          Accueil
        </h1>
        <p className="text-gray-600">
          Configurez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans
          .env.local
        </p>
      </div>
    );
  }

  const supabase = supabaseServer;
  const { data: products } = await supabase
    .from("products")
    .select("id, main_category, image_url")
    .eq("is_published", true);

  const countByMain: Record<string, number> = {};
  products?.forEach((p) => {
    const main = (p as { main_category?: string }).main_category ?? "homme";
    countByMain[main] = (countByMain[main] ?? 0) + 1;
  });

  return (
    <>
      <Hero />

      <section
        id="shop"
        className="scroll-mt-8 bg-sand/50 py-16 sm:py-20"
        aria-label="Collections"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-12">
            <h2 className="font-display text-2xl font-medium tracking-tight text-gray-900 sm:text-3xl">
              Choisissez votre univers
            </h2>
            <p className="mt-2 text-gray-600">
              Homme, Femme ou Enfant – découvrez nos pièces par collection.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {MAIN_CATEGORIES.map(({ slug, label }, i) => (
              <div
                key={slug}
                className="animate-fade-in-up opacity-0"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <GenderCard
                  slug={slug}
                  label={label}
                  productCount={countByMain[slug] ?? 0}
                  imageUrl={DEFAULT_CATEGORY_IMAGES[slug]}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
