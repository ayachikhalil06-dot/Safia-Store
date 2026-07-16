"use server";

import { createOrder } from "@/services/orders";
import { getShippingPriceByWilaya } from "@/services/shipping";
import { clearCartAction, getCartAction } from "./cart";
import type { CheckoutFormData } from "@/types";
import { revalidatePath } from "next/cache";

export async function checkoutAction(formData: CheckoutFormData) {
  const { cart } = await getCartAction();

  if (cart.items.length === 0) {
    return { success: false, error: "Votre panier est vide." };
  }

  const shipping = await getShippingPriceByWilaya(formData.wilayaCode);
  const shippingCost = shipping?.price ?? 0;

  try {
    const order = await createOrder(formData, cart.items, shippingCost);
    await clearCartAction();
    revalidatePath("/admin/orders");
    return { success: true, orderNumber: order.order_number, orderId: order.id };
  }
  catch (error) {
  console.error("ERREUR CHECKOUT :", error);

  return {
    success: false,
    error: JSON.stringify(error, null, 2),
  };
}
}

export async function getShippingCostAction(wilayaCode: number) {
  const shipping = await getShippingPriceByWilaya(wilayaCode);
  return shipping?.price ?? 0;
}
