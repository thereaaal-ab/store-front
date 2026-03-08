"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import type { CartItem as CartItemType } from "@/store/cartStore";
import { useCartStore } from "@/store/cartStore";
import { getProductImageUrl, isExternalImageUrl } from "@/lib/imageUrl";

type CartItemProps = {
  item: CartItemType;
};

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const imageSrc = getProductImageUrl(item.imageUrl ?? null);
  const lineTotal = item.priceAtTime * item.quantity;

  return (
    <div className="flex gap-5 py-6 border-b border-gray-100 last:border-0 group">
      {/* Image */}
      <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-[#f4f1ed]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-cover"
            unoptimized={isExternalImageUrl(imageSrc)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-xs italic text-gray-300">—</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-sm font-medium leading-snug text-gray-900 truncate">
              {item.name}
            </p>
            {item.size && (
              <p className="mt-0.5 text-xs uppercase tracking-widest text-gray-400">
                Taille {item.size}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              {item.priceAtTime.toFixed(2)} € / pièce
            </p>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={() => removeItem(item.productId, item.variantId)}
            className="shrink-0 p-1 text-gray-300 transition-colors hover:text-gray-700"
            aria-label="Supprimer l'article"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quantity + subtotal */}
        <div className="flex items-center justify-between">
          {/* Quantity stepper */}
          <div className="flex items-center gap-0 border border-gray-200">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
              className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="flex h-7 w-8 items-center justify-center text-xs font-medium text-gray-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
              className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Line total */}
          <p className="text-sm font-medium text-gray-900">{lineTotal.toFixed(2)} €</p>
        </div>
      </div>
    </div>
  );
}
