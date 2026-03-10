"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getProductImageUrl, isExternalImageUrl } from "@/lib/imageUrl";
import { ArrowRight } from "lucide-react";
type GenderCardProps = {
  slug: string;
  label: string;
  productCount: number;
  imageUrl?: string | null;
};

export function GenderCard({
  slug,
  label,
  productCount,
  imageUrl,
}: GenderCardProps) {
  const href = `/shop/${slug}`;
  const [imageError, setImageError] = useState(false);
  const imageSrc = getProductImageUrl(imageUrl ?? null);
  const hasImage = Boolean(imageSrc) && !imageError;

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl p-8",
        "transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
      )}
      aria-label={`Voir la collection ${label}`}
    >
      {hasImage ? (
        <>
          <Image
            src={imageSrc!}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            onError={() => setImageError(true)}
            unoptimized={isExternalImageUrl(imageSrc)}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-gray-900/85 via-gray-900/40 to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <div
          className={cn(
            "absolute inset-0",
            slug === "homme" && "bg-gradient-to-br from-slate-700 to-slate-900",
            slug === "femme" && "bg-gradient-to-br from-rose-800/90 to-rose-950",
            slug === "enfant" && "bg-gradient-to-br from-amber-700/90 to-amber-950"
          )}
          aria-hidden
        />
      )}
      <div className="relative flex flex-col gap-4">
        <h2 className="font-display text-3xl font-medium tracking-tight text-white drop-shadow-md sm:text-4xl">
          {label}
        </h2>
        <p className="text-sm text-white/90">
          {productCount} produit{productCount !== 1 ? "s" : ""}
        </p>
        <span className="inline-flex w-fit items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors group-hover:bg-white/95">
          Découvrir la collection
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
