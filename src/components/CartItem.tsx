"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/store/cartStore";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

type CartItemProps = {
  item: CartItemType;
};

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-border bg-card p-4"
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium truncate">{item.name}</p>
        {item.size && (
          <p className="text-sm text-muted-foreground">Taille : {item.size}</p>
        )}
        <p className="text-terracotta font-semibold">
          {item.priceAtTime.toFixed(2)} €
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) updateQuantity(item.productId, item.variantId, v);
          }}
          className="w-16 text-center"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => removeItem(item.productId, item.variantId)}
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="w-16 text-right font-semibold">
        {(item.priceAtTime * item.quantity).toFixed(2)} €
      </p>
    </div>
  );
}
