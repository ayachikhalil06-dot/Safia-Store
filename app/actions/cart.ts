"use server";

import { cookies } from "next/headers";
import {
  CART_COOKIE,
  CART_MAX_AGE,
  parseCart,
  serializeCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  getCartItemCount,
  getCartTotal,
} from "@/lib/cart";
import type { CartItem } from "@/types";

async function getCartFromCookie() {
  const cookieStore = await cookies();
  return parseCart(cookieStore.get(CART_COOKIE)?.value);
}

async function saveCart(cart: ReturnType<typeof parseCart>) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, serializeCart(cart), {
    maxAge: CART_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export async function getCartAction() {
  const cart = await getCartFromCookie();
  return {
    cart,
    itemCount: getCartItemCount(cart),
    total: getCartTotal(cart),
  };
}

export async function addToCartAction(item: CartItem) {
  const cart = await getCartFromCookie();
  const updated = addToCart(cart, item);
  await saveCart(updated);
  return { itemCount: getCartItemCount(updated) };
}

export async function updateQuantityAction(
  productId: string,
  variant: Record<string, string>,
  quantity: number
) {
  const cart = await getCartFromCookie();
  const updated = updateCartItemQuantity(cart, productId, variant, quantity);
  await saveCart(updated);
  return { cart: updated, total: getCartTotal(updated) };
}

export async function removeFromCartAction(
  productId: string,
  variant: Record<string, string>
) {
  const cart = await getCartFromCookie();
  const updated = removeFromCart(cart, productId, variant);
  await saveCart(updated);
  return { cart: updated, itemCount: getCartItemCount(updated) };
}

export async function clearCartAction() {
  await saveCart(clearCart());
}
