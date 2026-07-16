"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useTransition,
  useState,
} from "react";
import type { Cart, CartItem } from "@/types";
import {
  getCartAction,
  addToCartAction,
  updateQuantityAction,
  removeFromCartAction,
  clearCartAction,
} from "@/app/actions/cart";

interface CartContextValue {
  cart: Cart;
  itemCount: number;
  total: number;
  isPending: boolean;
  addItem: (item: CartItem) => Promise<void>;
  updateQuantity: (
    productId: string,
    variant: Record<string, string>,
    quantity: number
  ) => Promise<void>;
  removeItem: (
    productId: string,
    variant: Record<string, string>
  ) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  initialCart,
  initialCount,
  initialTotal,
}: {
  children: React.ReactNode;
  initialCart: Cart;
  initialCount: number;
  initialTotal: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({
    cart: initialCart,
    itemCount: initialCount,
    total: initialTotal,
  });

  const refresh = useCallback(async () => {
    const data = await getCartAction();
    setState({
      cart: data.cart,
      itemCount: data.itemCount,
      total: data.total,
    });
  }, []);

  const addItem = useCallback(
    async (item: CartItem) => {
      startTransition(async () => {
        await addToCartAction(item);
        await refresh();
      });
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (
      productId: string,
      variant: Record<string, string>,
      quantity: number
    ) => {
      startTransition(async () => {
        const result = await updateQuantityAction(
          productId,
          variant,
          quantity
        );
        setState((prev) => ({
          ...prev,
          cart: result.cart,
          total: result.total,
          itemCount: result.cart.items.reduce((s, i) => s + i.quantity, 0),
        }));
      });
    },
    []
  );

  const removeItem = useCallback(
    async (productId: string, variant: Record<string, string>) => {
      startTransition(async () => {
        const result = await removeFromCartAction(productId, variant);
        setState((prev) => ({
          ...prev,
          cart: result.cart,
          itemCount: result.itemCount,
          total: result.cart.items.reduce(
            (s, i) => s + i.price * i.quantity,
            0
          ),
        }));
      });
    },
    []
  );

  const clear = useCallback(async () => {
    startTransition(async () => {
      await clearCartAction();
      setState({ cart: { items: [] }, itemCount: 0, total: 0 });
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        isPending,
        addItem,
        updateQuantity,
        removeItem,
        clear,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
