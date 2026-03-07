"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductForCard } from "@/types/product";
import { FILTER_COLORS } from "@/constants";

type CategoryOption = { slug: string; name: string };

type ShopPageContentProps = {
  gender: string;
  genderLabel: string;
  initialProducts: ProductForCard[];
  categoryOptions: CategoryOption[];
};

type SortOption = "default" | "price-asc" | "price-desc";

const GENDER_TAGLINE: Record<string, string> = {
  homme: "Élégance masculine. Pièces intemporelles.",
  femme: "Grâce & raffinement. Savoir-faire d'exception.",
  enfant: "Douceur & style pour les plus petits.",
};

export function ShopPageContent({
  gender,
  genderLabel,
  initialProducts,
  categoryOptions,
}: ShopPageContentProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const toggleCategory = (slug: string) =>
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  const toggleColor = (color: string) =>
    setSelectedColors((prev) => {
      const next = new Set(prev);
      next.has(color) ? next.delete(color) : next.add(color);
      return next;
    });

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedColors(new Set());
    setPriceMin("");
    setPriceMax("");
  };

  const activeFilterCount =
    selectedCategories.size +
    selectedColors.size +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const filteredAndSorted = useMemo(() => {
    let list = initialProducts.filter((p) => {
      if (selectedCategories.size > 0 && !selectedCategories.has(p.category))
        return false;
      if (selectedColors.size > 0) {
        const productColor = p.color?.trim() || "";
        if (!productColor || !selectedColors.has(productColor)) return false;
      }
      const price = p.defaultPrice;
      if (priceMin !== "" && !isNaN(Number(priceMin)) && price < Number(priceMin))
        return false;
      if (priceMax !== "" && !isNaN(Number(priceMax)) && price > Number(priceMax))
        return false;
      return true;
    });
    if (sortBy === "price-asc")
      list = [...list].sort((a, b) => a.defaultPrice - b.defaultPrice);
    else if (sortBy === "price-desc")
      list = [...list].sort((a, b) => b.defaultPrice - a.defaultPrice);
    return list;
  }, [initialProducts, selectedCategories, selectedColors, priceMin, priceMax, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand to-white">
      {/* ── Page banner ───────────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden py-20 sm:py-28",
          gender === "homme" && "bg-gradient-to-br from-slate-800 to-slate-950",
          gender === "femme" && "bg-gradient-to-br from-[#4a2535] to-[#2a1020]",
          gender === "enfant" && "bg-gradient-to-br from-amber-800 to-amber-950",
          !["homme", "femme", "enfant"].includes(gender) && "bg-gradient-to-br from-hero-brown to-gray-900"
        )}
      >
        {/* Decorative dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden
        />
        {/* Subtle bottom fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-sand/30 to-transparent" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/50" aria-label="Fil d'Ariane">
            <Link href="/" className="transition-colors hover:text-white/80">Accueil</Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="text-white/80">{genderLabel}</span>
          </nav>

          <h1 className="font-display text-4xl font-medium tracking-tight text-white sm:text-5xl lg:text-6xl">
            {genderLabel}
          </h1>
          <p className="mt-3 text-sm tracking-wide text-white/60 sm:text-base">
            {GENDER_TAGLINE[gender] ?? "Découvrez notre sélection."}
          </p>

          {/* Thin gold rule */}
          <div className="mt-8 h-px w-16 bg-gold/60" aria-hidden />
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 border-b border-border/60 bg-sand/95 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Filter toggle (mobile) */}
          <button
            type="button"
            onClick={() => setFilterOpen((o) => !o)}
            className={cn(
              "flex items-center gap-2 text-xs uppercase tracking-widest transition-colors lg:hidden",
              hasActiveFilters ? "text-terracotta" : "text-gray-600 hover:text-gray-900"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filtres
            {hasActiveFilters && (
              <span className="rounded-full bg-terracotta px-1.5 py-0.5 text-[10px] font-medium text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <span className="hidden text-xs uppercase tracking-widest text-gray-500 lg:block">
            {filteredAndSorted.length} pièce{filteredAndSorted.length !== 1 ? "s" : ""}
          </span>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-gray-500 sm:inline">
              {filteredAndSorted.length} pièce{filteredAndSorted.length !== 1 ? "s" : ""}
            </span>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border-none bg-transparent text-xs uppercase tracking-widest text-gray-600 outline-none hover:text-gray-900 focus:ring-0"
              aria-label="Trier les produits"
            >
              <option value="default">Trier : Par défaut</option>
              <option value="price-asc">Trier : Prix croissant</option>
              <option value="price-desc">Trier : Prix décroissant</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* ── Sidebar filter ──────────────────────────────────── */}
          <aside
            className={cn(
              "shrink-0 space-y-8 lg:w-56",
              !filterOpen && "hidden lg:block"
            )}
          >
            {/* Header row */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-gray-500">
                Affiner
              </span>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-terracotta transition-opacity hover:opacity-70"
                  >
                    <X className="h-3 w-3" />
                    Effacer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className="text-gray-400 transition-colors hover:text-gray-700 lg:hidden"
                  aria-label="Fermer les filtres"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Category */}
            {categoryOptions.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-400">
                  Catégorie
                </p>
                <div className="flex flex-col gap-2.5">
                  {categoryOptions.map((c) => (
                    <label
                      key={c.slug}
                      className="group flex cursor-pointer items-center gap-3 text-sm text-gray-700 transition-colors hover:text-gray-900"
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                          selectedCategories.has(c.slug)
                            ? "border-terracotta bg-terracotta"
                            : "border-gray-300 group-hover:border-gray-500"
                        )}
                      >
                        {selectedCategories.has(c.slug) && (
                          <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedCategories.has(c.slug)}
                        onChange={() => toggleCategory(c.slug)}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-400">
                Couleur
              </p>
              <div className="flex flex-col gap-2.5">
                {FILTER_COLORS.map((color) => (
                  <label
                    key={color}
                    className="group flex cursor-pointer items-center gap-3 text-sm text-gray-700 transition-colors hover:text-gray-900"
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
                        selectedColors.has(color)
                          ? "border-terracotta bg-terracotta"
                          : "border-gray-300 group-hover:border-gray-500"
                      )}
                    >
                      {selectedColors.has(color) && (
                        <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selectedColors.has(color)}
                      onChange={() => toggleColor(color)}
                    />
                    {color}
                  </label>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-widest text-gray-400">
                Prix (€)
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="h-8 rounded-none border-x-0 border-b border-t-0 border-gray-300 bg-transparent px-0 text-sm shadow-none focus-visible:border-terracotta focus-visible:ring-0"
                />
                <span className="text-gray-400">–</span>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="h-8 rounded-none border-x-0 border-b border-t-0 border-gray-300 bg-transparent px-0 text-sm shadow-none focus-visible:border-terracotta focus-visible:ring-0"
                />
              </div>
            </div>
          </aside>

          {/* Thin vertical divider (desktop) */}
          <div className="hidden w-px shrink-0 bg-border/50 lg:block" aria-hidden />

          {/* ── Product grid ────────────────────────────────────── */}
          <div className="min-w-0 flex-1">
            {filteredAndSorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="mb-4 h-px w-12 bg-gold/40" aria-hidden />
                <p className="font-display text-xl text-gray-500">
                  Aucune pièce ne correspond à votre sélection.
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  Essayez de modifier ou d&apos;effacer les filtres.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 text-xs uppercase tracking-widest text-terracotta underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
                  >
                    Effacer tous les filtres
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {filteredAndSorted.map((product, i) => (
                  <div
                    key={product.id}
                    className="animate-fade-in-up opacity-0"
                    style={{
                      animationDelay: `${Math.min(i * 60, 400)}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
