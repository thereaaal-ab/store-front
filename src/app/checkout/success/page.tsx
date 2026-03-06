import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<{ orderId?: string; paid?: string; total?: string; status?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId, paid, total, status } = await searchParams;
  const paidNum = paid != null ? parseFloat(paid) : NaN;
  const totalNum = total != null ? parseFloat(total) : NaN;
  const isPartial = status === "partial" && !isNaN(paidNum) && !isNaN(totalNum);
  const remaining = isPartial ? totalNum - paidNum : 0;

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-foreground">
        Commande #{orderId ?? "—"} reçue !
      </h1>
      <p className="text-muted-foreground">
        On vous contacte via WhatsApp pour finaliser.
      </p>
      {isPartial && remaining > 0 && (
        <p className="text-sm text-muted-foreground">
          Vous avez payé <strong>{paidNum.toFixed(2)} €</strong>. Il reste{" "}
          <strong>{remaining.toFixed(2)} €</strong> à régler.
        </p>
      )}
      <Button asChild className="bg-terracotta hover:bg-terracotta/90">
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
