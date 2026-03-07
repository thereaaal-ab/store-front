"use server";

import { getSupabaseReader } from "@/lib/supabaseServer";

type CartEntry = {
  productId: string;
  variantId: string | null;
  quantity: number;
  priceAtTime: number;
};

type Input = {
  firstName: string;
  phone?: string;
  email?: string;
  cart: CartEntry[];
  /** Amount the client is paying now (for full payment = total, for partial = chosen amount) */
  paidAmount: number;
};

type Result = { success: true; orderId: string } | { success: false; error: string };

export async function createOrder(input: Input): Promise<Result> {
  const { firstName, phone, email, cart, paidAmount } = input;

  if (!firstName?.trim() || !Array.isArray(cart) || cart.length === 0) {
    return { success: false, error: "Prénom et panier requis." };
  }

  const sb = getSupabaseReader();
  if (!sb) {
    return { success: false, error: "Supabase non configuré. Ajoutez les variables d'environnement dans .env.local." };
  }
  const totalAmount = cart.reduce((s, i) => s + i.quantity * i.priceAtTime, 0);

  if (paidAmount < 0 || paidAmount > totalAmount) {
    return { success: false, error: "Montant payé invalide." };
  }

  const paymentStatus =
    paidAmount >= totalAmount ? "paid" : paidAmount > 0 ? "partial" : "unpaid";

  try {
    const { data: order, error: orderErr } = await sb
      .from("orders")
      .insert({
        first_name: firstName.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        total_amount: totalAmount.toFixed(2),
        paid_amount: paidAmount.toFixed(2),
        payment_status: paymentStatus,
      })
      .select("id")
      .single();

    if (orderErr || !order?.id) {
      console.error("orders insert error:", orderErr);
      return { success: false, error: "Impossible de créer la commande." };
    }

    const orderId = order.id;

    // Vérifier que tous les product_id existent (même projet Supabase que le back-office)
    const productIds = [...new Set(cart.map((item) => String(item.productId).trim()).filter(Boolean))];
    if (productIds.length === 0) {
      await sb.from("orders").delete().eq("id", orderId);
      return { success: false, error: "Panier invalide : aucun produit valide." };
    }

    const { data: existingProducts } = await sb
      .from("products")
      .select("id")
      .in("id", productIds);
    const existingIds = new Set((existingProducts ?? []).map((p) => p.id));
    const missingIds = productIds.filter((id) => !existingIds.has(id));
    if (missingIds.length > 0) {
      console.error("product_ids not found in products:", missingIds);
      await sb.from("orders").delete().eq("id", orderId);
      return {
        success: false,
        error:
          "Un ou plusieurs produits ne sont plus disponibles ou ne sont pas dans la même base. " +
          "Videz le panier, vérifiez que le storefront et le back-office utilisent le même projet Supabase, puis réessayez.",
      };
    }

    const orderItemsRows = cart.map((item) => ({
      order_id: orderId,
      product_id: String(item.productId).trim(),
      variant_id: item.variantId != null && item.variantId !== "" ? String(item.variantId).trim() : null,
      quantity: Math.max(1, Math.floor(Number(item.quantity)) || 1),
      price_at_time: String(Number(item.priceAtTime).toFixed(2)),
    }));

    const { error: itemsErr } = await sb.from("order_items").insert(orderItemsRows);

    if (itemsErr) {
      console.error("order_items insert error:", itemsErr.message, itemsErr.details);
      await sb.from("orders").delete().eq("id", orderId);
      return {
        success: false,
        error: "Erreur lors de l'enregistrement des articles. " + (itemsErr.message || ""),
      };
    }

    for (const item of cart) {
      if (item.variantId) {
        const { data: variant } = await sb
          .from("product_variants")
          .select("quantity")
          .eq("id", item.variantId)
          .single();

        const currentQty = variant?.quantity ?? 0;
        const newQty = Math.max(0, currentQty - item.quantity);

        const { error: updateErr } = await sb
          .from("product_variants")
          .update({ quantity: newQty })
          .eq("id", item.variantId);

        if (updateErr) {
          console.error("product_variants update error:", updateErr);
          await sb.from("order_items").delete().eq("order_id", orderId);
          await sb.from("orders").delete().eq("id", orderId);
          return { success: false, error: "Stock insuffisant ou erreur de mise à jour." };
        }
      }
    }

    return { success: true, orderId };
  } catch (e) {
    console.error("createOrder error:", e);
    return { success: false, error: "Une erreur inattendue s'est produite." };
  }
}
