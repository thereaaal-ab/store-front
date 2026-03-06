"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X } from "lucide-react";
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

export function ShopPageContent({
  genderLabel,
  initialProducts,
  categoryOptions,
}: ShopPageContentProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSelectedColors(new Set());
    setPriceMin("");
    setPriceMax("");
  };

  const hasActiveFilters =
    selectedCategories.size > 0 ||
    selectedColors.size > 0 ||
    priceMin !== "" ||
    priceMax !== "";

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
  }, [
    initialProducts,
    selectedCategories,
    selectedColors,
    priceMin,
    priceMax,
    sortBy,
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-medium tracking-tight text-gray-900 sm:text-3xl">
          {genderLabel}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">
            {filteredAndSorted.length} produit
            {filteredAndSorted.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="text-sm text-gray-600">
              Trier
            </Label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="default">Par défaut</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setFilterOpen((o) => !o)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-1 rounded-full bg-terracotta/20 px-1.5 text-xs">
                {selectedCategories.size + selectedColors.size + (priceMin ? 1 : 0) + (priceMax ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside
          className={cn(
            "space-y-6 rounded-lg border border-border bg-card p-4 lg:w-64 lg:shrink-0",
            !filterOpen && "hidden lg:block"
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Filtres</h2>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-terracotta"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Réinitialiser
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setFilterOpen(false)}
                aria-label="Fermer les filtres"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {categoryOptions.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-gray-700">
                Catégorie
              </h3>
              <div className="flex flex-col gap-1.5">
                {categoryOptions.map((c) => (
                  <label
                    key={c.slug}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.has(c.slug)}
                      onChange={() => toggleCategory(c.slug)}
                      className="rounded border-gray-300"
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Couleur
            </h3>
            <div className="flex flex-wrap gap-2">
              {FILTER_COLORS.map((color) => (
                <label
                  key={color}
                  className="flex cursor-pointer items-center gap-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedColors.has(color)}
                    onChange={() => toggleColor(color)}
                    className="rounded border-gray-300"
                  />
                  {color}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Prix (€)</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="h-9"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                min={0}
                step={1}
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAndSorted.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredAndSorted.length === 0 && (
            <p className="py-12 text-center text-gray-600">
              Aucun produit ne correspond à vos critères. Essayez de modifier
              les filtres.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
