"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const price = Number(product.defaultPrice);
  const hasVariants = product.variants.length > 0;
  const canAdd = product.totalStock > 0;

  return (
    <>
      <Card
        className={cn(
          "overflow-hidden border-olive/20 bg-card transition-all hover:shadow-md"
        )}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Pas d&apos;image
            </div>
          )}
          {product.totalStock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="destructive" className="text-sm">
                Rupture
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-foreground">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {product.description}
            </p>
          )}
          <p className="mt-2 text-xl font-bold text-terracotta">
            {price.toFixed(2)} €
          </p>
          {hasVariants && (
            <div className="mt-2 flex flex-wrap gap-1">
              {product.variants.map((v) => (
                <Badge key={v.id} variant="secondary" className="text-xs">
                  {v.size} : {v.quantity}
                </Badge>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button
              size="sm"
              className="w-full bg-terracotta hover:bg-terracotta/90"
              disabled={!canAdd}
              onClick={() => setDialogOpen(true)}
              aria-label="Ouvrir le panier pour choisir la quantité"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Ajouter au panier
            </Button>
          </div>
        </CardContent>
      </Card>
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
