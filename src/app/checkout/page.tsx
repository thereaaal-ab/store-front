"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { createOrder } from "@/app/actions/createOrder";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = getTotal();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

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
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
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
      <div className="min-h-screen bg-gradient-to-b from-sand to-white">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="font-display text-2xl font-medium text-gray-700">
            Votre panier est vide
          </h1>
          <p className="mt-3 text-sm text-gray-400">Rien à commander pour l&apos;instant.</p>
          <Link
            href="/#shop"
            className="mt-8 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-terracotta transition-opacity hover:opacity-70"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour aux collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand to-white">
      {/* Banner */}
      <div className="border-b border-gray-100 bg-sand px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <nav className="mb-4 flex items-center gap-1.5 text-xs uppercase tracking-widest text-gray-400">
            <Link href="/" className="transition-colors hover:text-gray-700">Accueil</Link>
            <span aria-hidden>›</span>
            <Link href="/cart" className="transition-colors hover:text-gray-700">Panier</Link>
            <span aria-hidden>›</span>
            <span className="text-gray-700">Commande</span>
          </nav>
          <h1 className="font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
            Votre commande
          </h1>
          <div className="mt-4 h-px w-12 bg-gold/60" aria-hidden />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Form */}
          <div className="min-w-0 flex-1">
            <p className="mb-8 text-xs uppercase tracking-widest text-gray-400">
              Vos coordonnées
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="firstName"
                  className="text-xs font-medium uppercase tracking-widest text-gray-500"
                >
                  Prénom / Nom <span className="text-terracotta">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="ex. Jean Dupont"
                  required
                  disabled={loading}
                  className="w-full rounded-none border-0 border-b border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-gray-900 disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="text-xs font-medium uppercase tracking-widest text-gray-500"
                >
                  Téléphone / WhatsApp
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 6 00 00 00 00"
                  disabled={loading}
                  className="w-full rounded-none border-0 border-b border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-gray-900 disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-medium uppercase tracking-widest text-gray-500"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@example.com"
                  disabled={loading}
                  className="w-full rounded-none border-0 border-b border-gray-300 bg-transparent px-0 py-2.5 text-sm text-gray-900 placeholder-gray-300 outline-none transition-colors focus:border-gray-900 disabled:opacity-50"
                />
              </div>

              {/* Note */}
              <p className="text-xs text-gray-400">
                Nous vous contacterons via WhatsApp pour confirmer la livraison et le paiement.
              </p>

              {/* Error */}
              {error && (
                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 bg-gray-900 px-6 py-4 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-terracotta disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-64"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Envoi en cours…
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5" />
                      Confirmer la commande
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order recap */}
          <aside className="w-full lg:w-80 lg:shrink-0">
            <div className="sticky top-24 border border-gray-100 bg-white p-8">
              <p className="mb-5 text-xs uppercase tracking-widest text-gray-400">
                Votre sélection · {itemCount} pièce{itemCount > 1 ? "s" : ""}
              </p>

              <div className="space-y-3">
                {items.map((item, i) => (
                  <div
                    key={`${item.productId}-${item.variantId ?? "n"}-${i}`}
                    className="flex justify-between gap-2 text-sm text-gray-600"
                  >
                    <span className="truncate">
                      {item.name}
                      {item.size ? ` · ${item.size}` : ""}
                      <span className="text-gray-400"> ×{item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium text-gray-900">
                      {(item.priceAtTime * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-6 h-px bg-gray-100" aria-hidden />

              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest text-gray-500">Total</span>
                <span className="font-display text-2xl font-medium text-gray-900">
                  {total.toFixed(2)} €
                </span>
              </div>

              <div className="mt-4 h-px w-8 bg-gold/40" aria-hidden />

              <p className="mt-5 text-xs text-gray-400 leading-relaxed">
                Le paiement s&apos;effectue à la livraison ou en boutique. Aucune information bancaire requise.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
