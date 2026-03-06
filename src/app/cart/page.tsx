"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/CartItem";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const total = getTotal();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Panier</h1>
      {items.length === 0 ? (
        <p className="text-muted-foreground">
          Votre panier est vide.{" "}
          <Link href="/" className="text-terracotta underline">
            Voir les catégories
          </Link>
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item, index) => (
              <CartItem key={`${item.productId}-${item.variantId ?? "n"}-${index}`} item={item} />
            ))}
          </div>
          <div className="flex flex-col items-end gap-4 border-t border-border pt-6">
            <p className="text-xl font-bold">
              Total : <span className="text-terracotta">{total.toFixed(2)} €</span>
            </p>
            <Button asChild className="bg-terracotta hover:bg-terracotta/90">
              <Link href="/checkout">Passer commande</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
