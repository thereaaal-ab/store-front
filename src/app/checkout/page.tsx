"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/createOrder";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim()) {
      setError("Le prénom est requis.");
      return;
    }
    if (items.length === 0) {
      setError("Le panier est vide.");
      return;
    }
    setLoading(true);
    const cart = items.map((i) => ({
      productId: i.productId,
      variantId: i.variantId ?? null,
      quantity: i.quantity,
      priceAtTime: i.priceAtTime,
    }));
    const result = await createOrder({
      firstName: firstName.trim(),
      cart,
      paidAmount: 0,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    clearCart();
    router.push(
      `/checkout/success?orderId=${result.orderId}&paid=0&total=${total}&status=unpaid`
    );
  }

  if (items.length === 0 && !error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
        <p className="text-muted-foreground">Votre panier est vide.</p>
        <Button asChild variant="outline">
          <a href="/">Retour à l&apos;accueil</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6 sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
      <p className="text-muted-foreground">
        Total : <strong className="text-terracotta">{total.toFixed(2)} €</strong>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="mb-2 block text-sm font-medium">
            Prénom / Nom <span className="text-destructive">*</span>
          </label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Votre prénom ou nom"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <Button
          type="submit"
          className="w-full bg-terracotta hover:bg-terracotta/90"
          disabled={loading}
        >
          {loading ? "Envoi..." : "Valider la commande"}
        </Button>
      </form>
    </div>
  );
}
