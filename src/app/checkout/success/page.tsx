import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

type Props = {
  searchParams: Promise<{
    orderId?: string;
    paid?: string;
    total?: string;
    status?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId, paid, total, status } = await searchParams;
  const paidNum = paid != null ? parseFloat(paid) : NaN;
  const totalNum = total != null ? parseFloat(total) : NaN;
  const isPartial =
    status === "partial" && !isNaN(paidNum) && !isNaN(totalNum) && paidNum > 0;
  const remaining = isPartial ? totalNum - paidNum : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand to-white">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        {/* Icon */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full border border-green-200 bg-green-50">
          <CheckCircle2 className="h-7 w-7 text-green-500" strokeWidth={1.5} />
        </div>

        {/* Gold rule */}
        <div className="mb-8 h-px w-12 bg-gold/60" aria-hidden />

        {/* Heading */}
        <h1 className="font-display text-3xl font-medium tracking-tight text-gray-900 sm:text-4xl">
          Commande reçue
        </h1>

        <p className="mt-4 text-sm text-gray-500">
          Merci pour votre commande. Nous vous contacterons très bientôt pour confirmer la livraison.
        </p>

        {/* Order number */}
        {orderId && (
          <div className="mt-8 border border-gray-100 bg-white px-8 py-5 w-full">
            <p className="text-xs uppercase tracking-widest text-gray-400">
              Numéro de commande
            </p>
            <p className="mt-1 font-display text-lg font-medium text-gray-900">
              #{orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}

        {/* Payment status */}
        {!isNaN(totalNum) && (
          <div className="mt-4 border border-gray-100 bg-white px-8 py-5 w-full">
            {isPartial && remaining > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Déjà réglé</span>
                  <span className="font-medium text-gray-900">{paidNum.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reste à payer</span>
                  <span className="font-medium text-terracotta">{remaining.toFixed(2)} €</span>
                </div>
                <div className="my-2 h-px bg-gray-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-xs uppercase tracking-widest text-gray-400">Total</span>
                  <span className="font-display font-medium text-gray-900">{totalNum.toFixed(2)} €</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-xs uppercase tracking-widest text-gray-400">Total commandé</span>
                <span className="font-display font-medium text-gray-900">{totalNum.toFixed(2)} €</span>
              </div>
            )}
          </div>
        )}

        {/* WhatsApp note */}
        <p className="mt-8 text-xs text-gray-400 leading-relaxed">
          Un message WhatsApp vous sera envoyé pour confirmer les détails de livraison et le mode de paiement.
        </p>

        <div className="mt-4 h-px w-8 bg-gold/40" aria-hidden />

        {/* CTA */}
        <Link
          href="/"
          className="mt-10 flex items-center gap-2 bg-gray-900 px-8 py-3.5 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-terracotta"
        >
          Retour à la boutique
        </Link>
      </div>
    </div>
  );
}
