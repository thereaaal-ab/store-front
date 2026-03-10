"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/store/cartStore";
import type { ProductForCard } from "@/types/product";

type AddToCartDialogProps = {
  product: ProductForCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddToCartDialog({
  product,
  open,
  onOpenChange,
}: AddToCartDialogProps) {
  const addItem = useCartStore((s) => s.addItem);
  const price = Number(product.defaultPrice);
  const hasVariants = product.variants.length > 0;

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const resetQuantities = useCallback(() => {
    if (hasVariants) {
      const initial: Record<string, number> = {};
      product.variants.forEach((v) => {
        initial[v.id] = 0;
      });
      setQuantities(initial);
    } else {
      setQuantities({ _noVariant: 1 });
    }
  }, [product.variants, hasVariants]);

  useEffect(() => {
    if (open) resetQuantities();
  }, [open, resetQuantities]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetQuantities();
      onOpenChange(next);
    },
    [onOpenChange, resetQuantities]
  );

  const setVariantQty = (variantId: string, value: number) => {
    const variant = product.variants.find((v) => v.id === variantId);
    const max = variant ? Math.max(0, variant.quantity) : 0;
    const clamped = Math.min(max, Math.max(0, value));
    setQuantities((prev) => ({ ...prev, [variantId]: clamped }));
  };

  const totalRequested = hasVariants
    ? Object.entries(quantities).reduce((s, [, q]) => s + q, 0)
    : quantities["_noVariant"] ?? 0;

  const handleConfirm = () => {
    if (hasVariants) {
      product.variants.forEach((v) => {
        const qty = quantities[v.id] ?? 0;
        if (qty > 0 && v.quantity >= qty) {
          addItem({
            productId: product.id,
            variantId: v.id,
            quantity: qty,
            priceAtTime: price,
            name: product.name,
            imageUrl: product.imageUrl ?? undefined,
            size: v.size,
          });
        }
      });
    } else {
      const qty = Math.max(1, Math.min(product.totalStock, quantities["_noVariant"] ?? 1));
      addItem({
        productId: product.id,
        variantId: undefined,
        quantity: qty,
        priceAtTime: price,
        name: product.name,
        imageUrl: product.imageUrl ?? undefined,
      });
    }
    handleOpenChange(false);
  };

  const availableVariants = product.variants.filter((v) => v.quantity > 0);
  const canConfirm =
    totalRequested > 0 &&
    (hasVariants
      ? Object.entries(quantities).every(
          ([id, q]) => q <= (product.variants.find((v) => v.id === id)?.quantity ?? 0)
        )
      : (quantities["_noVariant"] ?? 0) <= product.totalStock);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="bg-sand sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-gray-900">
            Ajouter au panier
          </DialogTitle>
          <DialogDescription>
            {product.name} – {price.toFixed(2)} €
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {hasVariants ? (
            <>
              <p className="text-sm text-gray-600">
                Choisissez la quantité pour chaque taille disponible.
              </p>
              {availableVariants.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white/60 p-3"
                >
                  <Label htmlFor={`qty-${v.id}`} className="font-medium text-gray-900">
                    Taille {v.size}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`qty-${v.id}`}
                      type="number"
                      min={0}
                      max={v.quantity}
                      value={quantities[v.id] ?? 0}
                      onChange={(e) =>
                        setVariantQty(v.id, parseInt(e.target.value, 10) || 0)
                      }
                      className="w-20 text-center"
                      aria-label={`Quantité pour taille ${v.size}`}
                    />
                  </div>
                </div>
              ))}
              {availableVariants.length === 0 && (
                <p className="text-sm text-gray-500">Aucune taille en stock.</p>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Quantité
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="qty-no-variant" className="font-medium text-gray-900">
                  Quantité
                </Label>
                <Input
                  id="qty-no-variant"
                  type="number"
                  min={1}
                  max={product.totalStock}
                  value={quantities["_noVariant"] ?? 1}
                  onChange={(e) =>
                    setQuantities((prev) => ({
                      ...prev,
                      _noVariant: Math.max(
                        1,
                        Math.min(product.totalStock, parseInt(e.target.value, 10) || 1)
                      ),
                    }))
                  }
                  className="w-24 text-center"
                  aria-label="Quantité"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            className="bg-terracotta hover:bg-terracotta/90"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            Ajouter au panier {totalRequested > 0 ? `(${totalRequested})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
