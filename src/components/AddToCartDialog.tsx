"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import type { ProductForCard } from "@/types/product";

type AddToCartDialogProps = {
  product: ProductForCard;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Sort numeric sizes first (e.g. chaussures), then alphabetical */
function sortVariants<T extends { size: string }>(variants: T[]): T[] {
  return [...variants].sort((a, b) => {
    const na = Number.parseFloat(a.size);
    const nb = Number.parseFloat(b.size);
    const aNum = !Number.isNaN(na);
    const bNum = !Number.isNaN(nb);
    if (aNum && bNum) return na - nb;
    return String(a.size).localeCompare(String(b.size), "fr");
  });
}

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

  const bumpVariantQty = (variantId: string, delta: number) => {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant || variant.quantity <= 0) return;
    const current = quantities[variantId] ?? 0;
    setVariantQty(variantId, current + delta);
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
      const qty = Math.max(
        1,
        Math.min(product.totalStock, quantities["_noVariant"] ?? 1)
      );
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

  const canConfirm =
    totalRequested > 0 &&
    (hasVariants
      ? Object.entries(quantities).every(
          ([id, q]) =>
            q <= (product.variants.find((v) => v.id === id)?.quantity ?? 0)
        )
      : (quantities["_noVariant"] ?? 0) <= product.totalStock);

  const availableVariants = useMemo(() => {
    const withStock = product.variants.filter((v) => v.quantity > 0);
    return sortVariants(withStock);
  }, [product.variants]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[90vh] max-w-[calc(100vw-1.5rem)] flex-col gap-3 overflow-hidden bg-sand p-4 sm:max-w-md sm:p-6"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 space-y-1 text-left">
          <DialogTitle className="font-display text-gray-900">
            Ajouter au panier
          </DialogTitle>
          <DialogDescription>
            {product.name} – {price.toFixed(2)} €
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex flex-1 flex-col gap-3 overflow-hidden">
          {hasVariants ? (
            <>
              <p className="shrink-0 text-sm text-gray-600">
                Choisissez les tailles et quantités.
              </p>
              <div className="min-h-0 flex flex-1 flex-col overflow-hidden rounded-lg border border-border/60 bg-white/40">
                <div className="max-h-[min(52vh,16rem)] overflow-y-auto overscroll-contain px-3 py-3 sm:max-h-[min(48vh,18rem)]">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {availableVariants.map((v) => {
                      const qty = quantities[v.id] ?? 0;
                      return (
                        <div
                          key={v.id}
                          className="flex flex-col gap-1.5 rounded-lg border border-border bg-white/80 p-2 shadow-sm"
                        >
                          <div className="text-center">
                            <span className="text-sm font-semibold text-gray-900">
                              {v.size}
                            </span>
                          </div>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0 touch-manipulation"
                              disabled={qty <= 0}
                              aria-label={`Diminuer taille ${v.size}`}
                              onClick={() => bumpVariantQty(v.id, -1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="min-w-[1.25rem] text-center text-sm font-medium tabular-nums">
                              {qty}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0 touch-manipulation"
                              disabled={qty >= v.quantity}
                              aria-label={`Augmenter taille ${v.size}`}
                              onClick={() => bumpVariantQty(v.id, 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {availableVariants.length === 0 && (
                    <p className="py-6 text-center text-sm text-gray-500">
                      Aucune taille en stock.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="shrink-0 space-y-3">
              <p className="text-sm text-gray-600">Quantité</p>
              <div className="flex items-center gap-3">
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
                        Math.min(
                          product.totalStock,
                          parseInt(e.target.value, 10) || 1
                        )
                      ),
                    }))
                  }
                  className="w-24 text-center"
                  aria-label="Quantité"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border/40 pt-3 sm:border-t-0 sm:pt-0 sm:gap-0">
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
