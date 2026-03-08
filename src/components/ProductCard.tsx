"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProductImageUrl, isExternalImageUrl } from "@/lib/imageUrl";
import type { ProductForCard } from "@/types/product";

const AddToCartDialog = dynamic(
  () => import("@/components/AddToCartDialog").then((m) => m.AddToCartDialog),
  { ssr: false }
);

export type { ProductForCard, ProductVariant } from "@/types/product";

type ProductCardProps = {
  product: ProductForCard;
};

export function ProductCard({ product }: ProductCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const price = Number(product.defaultPrice);
  const canAdd = product.totalStock > 0;
  const availableSizes = product.variants.filter((v) => v.quantity > 0).map((v) => v.size);
  const imageSrc = getProductImageUrl(product.imageUrl);

  return (
    <>
      <article
        className="group flex flex-col"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Image ────────────────────────────────────────────── */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f4f1ed]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              className={cn(
                "object-cover transition-transform duration-700 ease-out",
                hovered && "scale-105"
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized={isExternalImageUrl(imageSrc)}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-sm italic text-gray-400">
                Pas d&apos;image
              </span>
            </div>
          )}

          {/* Out-of-stock overlay */}
          {!canAdd && (
            <div className="absolute inset-0 flex items-end justify-center bg-black/30 pb-6">
              <span className="rounded-full border border-white/60 bg-black/60 px-4 py-1.5 text-xs uppercase tracking-widest text-white backdrop-blur-sm">
                Rupture de stock
              </span>
            </div>
          )}

          {/* Quick-add button — appears on hover */}
          {canAdd && (
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex justify-center pb-4 transition-all duration-300",
                hovered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              )}
            >
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-gray-900 shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
                aria-label={`Ajouter ${product.name} au panier`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Ajouter au panier
              </button>
            </div>
          )}
        </div>

        {/* ── Info ─────────────────────────────────────────────── */}
        <div className="mt-4 flex flex-col gap-1 px-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="flex-1 font-display text-sm font-medium leading-snug text-gray-900 group-hover:text-terracotta transition-colors duration-200">
              {product.name}
            </h3>
            <span className="shrink-0 text-sm font-medium text-gray-900">
              {price.toFixed(2)}&thinsp;€
            </span>
          </div>

          {/* Available sizes */}
          {availableSizes.length > 0 && (
            <p className="text-xs text-gray-400 tracking-wide">
              {availableSizes.join(" · ")}
            </p>
          )}
        </div>

        {/* Mobile CTA (no hover on touch devices) */}
        {canAdd && (
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="mt-3 w-full border border-gray-200 bg-transparent py-2.5 text-xs font-medium uppercase tracking-widest text-gray-700 transition-colors hover:border-terracotta hover:text-terracotta sm:hidden"
            aria-label={`Ajouter ${product.name} au panier`}
          >
            Ajouter
          </button>
        )}
      </article>

      {dialogOpen && (
        <AddToCartDialog
          product={product}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </>
  );
}
