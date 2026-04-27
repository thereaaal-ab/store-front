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
import { cn } from "@/lib/utils";
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

  const [qtyByVariantId, setQtyByVariantId] = useState<Record<string, number>>(
    {}
  );
  const [noVariantQty, setNoVariantQty] = useState(1);

  const resetState = useCallback(() => {
    setQtyByVariantId({});
    setNoVariantQty(1);
  }, []);

  useEffect(() => {
    if (open) resetState();
  }, [open, resetState]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) resetState();
      onOpenChange(next);
    },
    [onOpenChange, resetState]
  );

  const availableVariants = useMemo(() => {
    const withStock = product.variants.filter((v) => v.quantity > 0);
    return sortVariants(withStock);
  }, [product.variants]);

  const setQtyForVariant = (
    variantId: string,
    raw: number,
    maxStock: number
  ) => {
    const next = Math.min(maxStock, Math.max(0, raw));
    setQtyByVariantId((prev) => ({ ...prev, [variantId]: next }));
  };

  const bumpVariant = (variantId: string, delta: number, maxStock: number) => {
    const cur = qtyByVariantId[variantId] ?? 0;
    setQtyForVariant(variantId, cur + delta, maxStock);
  };

  const totalPiecesToAdd = useMemo(() => {
    return availableVariants.reduce((sum, v) => {
      return sum + (qtyByVariantId[v.id] ?? 0);
    }, 0);
  }, [availableVariants, qtyByVariantId]);

  const handleConfirm = () => {
    if (hasVariants) {
      let added = false;
      for (const v of availableVariants) {
        const q = qtyByVariantId[v.id] ?? 0;
        if (q <= 0 || q > v.quantity) continue;
        addItem({
          productId: product.id,
          variantId: v.id,
          quantity: q,
          priceAtTime: price,
          name: product.name,
          imageUrl: product.imageUrl ?? undefined,
          size: v.size,
        });
        added = true;
      }
      if (!added) return;
    } else {
      const q = Math.max(1, Math.min(product.totalStock, noVariantQty));
      addItem({
        productId: product.id,
        variantId: undefined,
        quantity: q,
        priceAtTime: price,
        name: product.name,
        imageUrl: product.imageUrl ?? undefined,
      });
    }
    handleOpenChange(false);
  };

  const canConfirmVariants =
    availableVariants.length > 0 && totalPiecesToAdd >= 1;

  const canConfirmNoVariant =
    noVariantQty >= 1 && noVariantQty <= product.totalStock;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 border-gray-200 bg-white p-6 shadow-xl sm:max-w-lg sm:p-8",
          "max-h-[min(92vh,640px)] max-w-[calc(100vw-1.5rem)] overflow-y-auto"
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="shrink-0 space-y-2 pb-6 text-left">
          <DialogTitle className="font-display text-xl font-medium tracking-tight text-gray-900">
            Ajouter au panier
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed text-gray-600">
            <span className="font-medium text-gray-900">{product.name}</span>
            <span className="text-gray-400"> · </span>
            <span className="tabular-nums">{price.toFixed(2)} €</span>
          </DialogDescription>
        </DialogHeader>

        <div className="pb-6">
          {hasVariants ? (
            <>
              {availableVariants.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Aucune taille en stock.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {availableVariants.map((v) => {
                      const maxStock = Math.max(0, v.quantity);
                      const draft = qtyByVariantId[v.id] ?? 0;
                      const selected = draft > 0;

                      return (
                        <div
                          key={v.id}
                          className={cn(
                            "flex flex-col rounded-xl border p-3 transition-colors",
                            "touch-manipulation",
                            selected
                              ? "border-gray-900 bg-gray-900/[0.06] shadow-sm"
                              : "border-gray-200 bg-gray-50/40 hover:border-gray-300"
                          )}
                        >
                          {/* Size + stock badge — one visual group */}
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-lg font-semibold tabular-nums leading-none text-gray-900">
                              {v.size}
                            </span>
                            <span
                              className="inline-flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-medium tabular-nums text-gray-600 ring-1 ring-gray-200"
                              title={`${maxStock} en stock`}
                            >
                              {maxStock}
                            </span>
                          </div>

                          {/* Single inline quantity row — centered, grouped */}
                          <div className="mt-3 flex w-full items-center justify-center gap-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 rounded-md text-gray-700 hover:bg-white/80"
                              disabled={draft <= 0}
                              aria-label={`Diminuer quantité taille ${v.size}`}
                              onClick={() => bumpVariant(v.id, -1, maxStock)}
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={2} />
                            </Button>
                            <Input
                              type="number"
                              min={0}
                              max={maxStock}
                              value={draft === 0 ? "" : draft}
                              onChange={(e) => {
                                const n = parseInt(e.target.value, 10);
                                if (Number.isNaN(n)) {
                                  setQtyForVariant(v.id, 0, maxStock);
                                } else {
                                  setQtyForVariant(v.id, n, maxStock);
                                }
                              }}
                              className={cn(
                                "h-8 w-10 shrink-0 border-0 bg-transparent px-1 text-center text-sm font-semibold tabular-nums shadow-none",
                                "focus-visible:ring-0 focus-visible:ring-offset-0"
                              )}
                              aria-label={`Quantité taille ${v.size}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 rounded-md text-gray-700 hover:bg-white/80"
                              disabled={draft >= maxStock}
                              aria-label={`Augmenter quantité taille ${v.size}`}
                              onClick={() => bumpVariant(v.id, 1, maxStock)}
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-center text-xs leading-relaxed text-gray-500">
                    Choisissez une quantité par taille. Le badge indique le stock
                    disponible. Les tailles sélectionnées sont mises en évidence.
                  </p>
                </>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <Label
                htmlFor="qty-no-variant"
                className="text-sm font-medium text-gray-900"
              >
                Quantité
              </Label>
              <div className="mx-auto flex max-w-[200px] items-center justify-center gap-1 rounded-lg border border-gray-200 bg-gray-50/50 p-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={noVariantQty <= 1}
                  onClick={() => setNoVariantQty((q) => Math.max(1, q - 1))}
                  aria-label="Diminuer"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="qty-no-variant"
                  type="number"
                  min={1}
                  max={product.totalStock}
                  value={noVariantQty}
                  onChange={(e) =>
                    setNoVariantQty(
                      Math.min(
                        product.totalStock,
                        Math.max(1, parseInt(e.target.value, 10) || 1)
                      )
                    )
                  }
                  className="h-9 w-14 border-0 bg-transparent text-center text-base font-semibold shadow-none focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={noVariantQty >= product.totalStock}
                  onClick={() =>
                    setNoVariantQty((q) =>
                      Math.min(product.totalStock, q + 1)
                    )
                  }
                  aria-label="Augmenter"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="shrink-0 gap-3 border-t border-gray-100 pt-6 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 bg-white"
            onClick={() => handleOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            className="bg-terracotta px-6 font-medium hover:bg-terracotta/90"
            disabled={
              hasVariants ? !canConfirmVariants : !canConfirmNoVariant
            }
            onClick={handleConfirm}
          >
            Ajouter au panier
            {hasVariants && totalPiecesToAdd > 0
              ? ` (${totalPiecesToAdd})`
              : !hasVariants && noVariantQty > 0
                ? ` (${noVariantQty})`
                : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
