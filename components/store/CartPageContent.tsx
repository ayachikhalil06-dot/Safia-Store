"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/format";
import { Button } from "@/components/ui/Button";

export function CartPageContent() {
  const { cart, total, updateQuantity, removeItem, isPending } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-neutral-300" />
        <h2 className="mt-4 text-lg font-medium text-neutral-900">
          Votre panier est vide
        </h2>
        <p className="mt-2 text-sm text-neutral-500">
          Découvrez nos produits et ajoutez-les à votre panier.
        </p>
        <Link href="/products" className="mt-6">
          <Button>
            Voir les produits
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
   <div className="grid gap-10 lg:grid-cols-[2fr_1fr] items-start">
      <div className="lg:col-span-2 space-y-4">
        {cart.items.map((item) => {
          const variantKey = JSON.stringify(item.variant);
          return (
            <div
              key={`${item.productId}-${variantKey}`}
              className="flex gap-6 rounded-3xl bg-pink-100 p-6 shadow-lg transition hover:shadow-xl"
            >
              <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-2xl bg-white shadow">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                    N/A
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                     className="text-xl font-bold text-neutral-900 hover:text-pink-600"
                    >
                      {item.name}
                    </Link>
                    {Object.keys(item.variant).length > 0 && (
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {Object.entries(item.variant)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variant)}
                    className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label="Supprimer"
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-xl border border-pink-200 bg-white shadow-sm">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variant,
                          item.quantity - 1
                        )
                      }
                      className="p-1.5 text-neutral-600 hover:text-neutral-900"
                      disabled={isPending}
                      aria-label="Diminuer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.variant,
                          item.quantity + 1
                        )
                      }
                      className="p-1.5 text-neutral-600 hover:text-neutral-900"
                      disabled={isPending || item.quantity >= item.maxStock}
                      aria-label="Augmenter"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-neutral-900">Récapitulatif</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Sous-total</span>
              <span className="font-medium">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Livraison</span>
              <span className="text-neutral-500">Calculée à l&apos;étape suivante</span>
            </div>
            <div className="border-t border-neutral-200 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-neutral-900">Total</span>
                <span className="text-lg font-semibold">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
          <Link href="/checkout" className="mt-6 block">
            <Button size="lg" className="w-full">
              Passer la commande
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link
            href="/products"
            className="mt-3 block text-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
