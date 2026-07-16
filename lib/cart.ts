import type { Cart, CartItem } from "@/types";

export const CART_COOKIE = "store_cart";
export const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function parseCart(cookieValue: string | undefined): Cart {
  if (!cookieValue) return { items: [] };
  try {
    const parsed = JSON.parse(decodeURIComponent(cookieValue)) as Cart;
    if (!parsed.items || !Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

export function serializeCart(cart: Cart): string {
  return encodeURIComponent(JSON.stringify(cart));
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function addToCart(cart: Cart, item: CartItem): Cart {
  const existingIndex = cart.items.findIndex(
    (i) =>
      i.productId === item.productId &&
      JSON.stringify(i.variant) === JSON.stringify(item.variant)
  );

  if (existingIndex >= 0) {
    const updated = [...cart.items];
    const existing = updated[existingIndex];
    updated[existingIndex] = {
      ...existing,
      quantity: Math.min(existing.quantity + item.quantity, item.maxStock),
    };
    return { items: updated };
  }

  return { items: [...cart.items, item] };
}

export function updateCartItemQuantity(
  cart: Cart,
  productId: string,
  variant: Record<string, string>,
  quantity: number
): Cart {
  if (quantity <= 0) {
    return removeFromCart(cart, productId, variant);
  }
  return {
    items: cart.items.map((item) =>
      item.productId === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
        ? { ...item, quantity: Math.min(quantity, item.maxStock) }
        : item
    ),
  };
}

export function removeFromCart(
  cart: Cart,
  productId: string,
  variant: Record<string, string>
): Cart {
  return {
    items: cart.items.filter(
      (item) =>
        !(
          item.productId === productId &&
          JSON.stringify(item.variant) === JSON.stringify(variant)
        )
    ),
  };
}

export function clearCart(): Cart {
  return { items: [] };
}
