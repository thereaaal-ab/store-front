"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, ArrowLeft, ArrowRight, Minus, Plus, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { getProductImageUrl, isExternalImageUrl } from "@/lib/imageUrl";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = getTotal();
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);
  const groupedItems = useMemo(() => {
    const byProduct = new Map<
      string,
      {
        productId: string;
        name: string;
        imageUrl?: string;
        lines: typeof items;
      }
    >();
    for (const item of items) {
      const existing = byProduct.get(item.productId);
      if (existing) {
        existing.lines.push(item);
      } else {
        byProduct.set(item.productId, {
          productId: item.productId,
          name: item.name,
          imageUrl: item.imageUrl,
          lines: [item],
        });
      }
    }
    return Array.from(byProduct.values()).map((group) => {
      const totalQty = group.lines.reduce((sum, line) => sum + line.quantity, 0);
      const totalPrice = group.lines.reduce(
        (sum, line) => sum + line.priceAtTime * line.quantity,
        0
      );
      return { ...group, totalQty, totalPrice };
    });
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand to-white">
      {/* Page banner */}
      <div className="border-b border-gray-100 bg-sand px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <nav className="mb-4 flex items-center gap-1.5 text-xs uppercase tracking-widest text-gray-400">
            <Link href="/" className="transition-colors hover:text-gray-700">Accueil</Link>
            <span aria-hidden>›</span>
            <span className="text-gray-700">Panier</span>
          </nav>
          <div className="flex items-end gap-4">
            <h1 className="font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
              Panier
            </h1>
            {itemCount > 0 && (
              <span className="mb-1 text-sm text-gray-400">
                {itemCount} article{itemCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="mt-4 h-px w-12 bg-gold/60" aria-hidden />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="mb-6 h-12 w-12 text-gray-200" strokeWidth={1} />
            <h2 className="font-display text-2xl font-medium text-gray-700">
              Votre panier est vide
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Découvrez nos collections et ajoutez des pièces à votre sélection.
            </p>
            <div className="mt-4 h-px w-10 bg-gold/40" aria-hidden />
            <Link
              href="/#shop"
              className="mt-8 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-terracotta transition-opacity hover:opacity-70"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voir les collections
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
            {/* Items list */}
            <div className="min-w-0 flex-1">
              <div>
                {groupedItems.map((group) => {
                  const imageSrc = getProductImageUrl(group.imageUrl ?? null);
                  return (
                    <div
                      key={group.productId}
                      className="group border-b border-gray-100 py-6 last:border-0"
                    >
                      <div className="flex gap-5">
                        <div className="relative h-28 w-20 shrink-0 overflow-hidden bg-[#f4f1ed]">
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={group.name}
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

                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-display text-sm font-medium leading-snug text-gray-900">
                                {group.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                {group.totalQty} pièce{group.totalQty > 1 ? "s" : ""} au total
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                group.lines.forEach((line) =>
                                  removeItem(group.productId, line.variantId)
                                )
                              }
                              className="shrink-0 p-1 text-gray-300 transition-colors hover:text-gray-700"
                              aria-label={`Supprimer ${group.name}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {group.lines.map((line) => (
                              <div
                                key={`${line.productId}-${line.variantId ?? "n"}`}
                                className="flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <p className="text-xs uppercase tracking-widest text-gray-400">
                                    {line.size ? `Taille ${line.size}` : "Quantité"}
                                  </p>
                                  <p className="mt-0.5 text-xs text-gray-400">
                                    {line.priceAtTime.toFixed(2)} € / pièce
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-0 border border-gray-200">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQuantity(
                                          line.productId,
                                          line.variantId,
                                          line.quantity - 1
                                        )
                                      }
                                      className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                      aria-label="Diminuer la quantité"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="flex h-7 w-8 items-center justify-center text-xs font-medium text-gray-900">
                                      {line.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQuantity(
                                          line.productId,
                                          line.variantId,
                                          line.quantity + 1
                                        )
                                      }
                                      className="flex h-7 w-7 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                      aria-label="Augmenter la quantité"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>

                                  <p className="w-20 text-right text-sm font-medium text-gray-900">
                                    {(line.priceAtTime * line.quantity).toFixed(2)} €
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex items-center justify-end border-t border-gray-100 pt-3">
                            <p className="text-sm font-medium text-gray-900">
                              {group.totalPrice.toFixed(2)} €
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/#shop"
                className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-400 transition-colors hover:text-gray-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Continuer mes achats
              </Link>
            </div>

            {/* Order summary panel */}
            <aside className="w-full lg:w-80 lg:shrink-0">
              <div className="sticky top-24 border border-gray-100 bg-white p-8">
                <h2 className="font-display text-lg font-medium text-gray-900">
                  Récapitulatif
                </h2>
                <div className="mt-6 space-y-3">
                  {groupedItems.map((group) => (
                    <div
                      key={group.productId}
                      className="space-y-1.5 text-sm text-gray-600"
                    >
                      <span className="block truncate font-medium text-gray-900">
                        {group.name}
                      </span>
                      {group.lines.map((line) => (
                        <div
                          key={`${line.productId}-${line.variantId ?? "n"}-summary`}
                          className="flex justify-between gap-2"
                        >
                          <span className="truncate">
                            {line.size ? `${line.size}` : "Unique"}
                            <span className="text-gray-400"> ×{line.quantity}</span>
                          </span>
                          <span className="shrink-0 font-medium text-gray-900">
                            {(line.priceAtTime * line.quantity).toFixed(2)} €
                          </span>
                        </div>
                      ))}
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

                <p className="mt-2 text-xs text-gray-400">
                  Livraison et paiement confirmés en boutique ou via WhatsApp.
                </p>

                <div className="mt-4 h-px w-8 bg-gold/40" aria-hidden />

                <Link
                  href="/checkout"
                  className="mt-8 flex w-full items-center justify-center gap-2 bg-gray-900 px-6 py-3.5 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-terracotta"
                >
                  Passer commande
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
