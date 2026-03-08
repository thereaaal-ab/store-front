"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/lib/imageUrl";
import { Package } from "lucide-react";

export type CategoryCardProps = {
  slug: string;
  name: string;
  count: number;
  imageUrl?: string | null;
};

export function CategoryCard({
  slug,
  name,
  count,
  imageUrl,
}: CategoryCardProps) {
  const href = `/category/${slug}`;
  const imageSrc = getProductImageUrl(imageUrl ?? null);
  const hasImage = Boolean(imageSrc);

  return (
    <Link
      href={href}
      className={cn(
        "group relative block min-h-[300px] overflow-hidden rounded-2xl",
        "transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2",
        "sm:min-h-[340px] lg:min-h-[380px]"
      )}
      aria-label={`Voir les produits de la catégorie ${name}`}
    >
      {/* Background: image or gradient fallback */}
      <div className="absolute inset-0">
        {hasImage ? (
          <>
            <Image
              src={imageSrc!}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"
              aria-hidden
            />
          </>
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-olive/30 via-sand to-terracotta/10"
            aria-hidden
          />
        )}
      </div>

      {/* Top-right: product count badge */}
      <div className="absolute right-4 top-4">
        <Badge
          className="border-0 bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm"
          variant="secondary"
        >
          {count} produit{count !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Bottom: title + CTA */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6",
          hasImage ? "text-white" : "text-gray-800"
        )}
      >
        <h2 className="font-display text-2xl font-medium tracking-tight drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5 sm:text-3xl">
          {name}
        </h2>
        <span
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium shadow-md",
            "opacity-0 transition-all duration-300 group-hover:opacity-100",
            "translate-y-2 group-hover:translate-y-0",
            hasImage
              ? "bg-white/90 text-gray-800"
              : "bg-terracotta/90 text-white"
          )}
        >
          Voir les produits
        </span>
      </div>

      {/* Fallback icon when no image */}
      {!hasImage && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-olive/40"
          aria-hidden
        >
          <Package className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>
      )}
    </Link>
  );
}
