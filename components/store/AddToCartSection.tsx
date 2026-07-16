"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  Check,
  Star,
  Truck,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import type { ProductWithImages, ProductVariant } from "@/types";
import { getImageUrlFromPath } from "@/lib/storage";
import { formatPrice } from "@/utils/format";
import { getDiscountPercentage } from "@/utils/helpers";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

interface AddToCartProps {
  product: ProductWithImages;
  average: number;
  reviewCount: number;
}

export function AddToCartSection({
  product,
  average,
  reviewCount,
}: AddToCartProps) {
  const { addItem, isPending } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);

  const variants = (product.variants || []) as ProductVariant[];
  const variantGroups = variants.reduce(
    (acc, v) => {
      if (!acc[v.type]) acc[v.type] = [];
      acc[v.type].push(v);
      return acc;
    },
    {} as Record<string, ProductVariant[]>
  );

  const variantTypes = Object.keys(variantGroups);
  const allVariantsSelected =
    variantTypes.length === 0 ||
    variantTypes.every((type) => selectedVariants[type]);

  const selectedVariantObjects = variants.filter((v) =>
    Object.entries(selectedVariants).some(
      ([type, val]) => v.type === type && v.value === val
    )
  );

  const priceAdjustment = selectedVariantObjects.reduce(
    (sum, v) => sum + (v.price_adjustment || 0),
    0
  );
  const finalPrice = product.price + priceAdjustment;

  const primaryImage =
    product.images.find((img) => img.is_primary) || product.images[0];
  const imageUrl = primaryImage
    ? getImageUrlFromPath(primaryImage.storage_path)
    : null;

  const discount = getDiscountPercentage(product.price, product.compare_at_price);
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || !allVariantsSelected) return;

    await addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: finalPrice,
      quantity,
      imageUrl,
      variant: selectedVariants,
      maxStock: product.stock,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const variantLabels: Record<string, string> = {
    color: "Couleur",
    model: "Modèle",
    size: "Taille",
    other: "Option",
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-start gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("text-4xl font-semibold tracking-tight", discount && "text-red-600")}>
                {formatPrice(finalPrice)}
              </span>
              {product.compare_at_price && (
                <span className="text-lg text-neutral-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>
            {discount && (
              <Badge variant="sale" className="mt-2">
                -{discount}%
              </Badge>
            )}
          </div>
        </div>
        {product.short_description && (
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
            {product.short_description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
  <div className="flex text-yellow-400">
    {[1,2,3,4,5].map((i) => (
      <Star key={i} size={16} className="fill-yellow-400" />
    ))}
  </div>

  <span className="text-sm text-neutral-500">
    Produit vérifié
  </span>
</div>

      </div>

      {variantTypes.map((type) => (
        <div key={type} className="space-y-1">
          <p className="mb-2 text-sm font-medium text-neutral-900">
            {variantLabels[type] || type}
          </p>
          <div className="flex flex-wrap gap-2">
            {variantGroups[type].map((variant) => (
              <button
                key={variant.id}
                onClick={() =>
                  setSelectedVariants((prev) => ({
                    ...prev,
                    [type]: variant.value,
                  }))
                }
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition-all duration-200",
                  selectedVariants[type] === variant.value
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                )}
              >
                {variant.type === "color" && variant.hex && (
                  <span
                    className="mr-2 inline-block h-3 w-3 rounded-full border border-neutral-300"
                    style={{ backgroundColor: variant.hex }}
                  />
                )}
                {variant.value}
                {variant.price_adjustment ? (
                  <span className="ml-1 text-xs opacity-70">
                    (+{formatPrice(variant.price_adjustment)})
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-neutral-300">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2.5 text-neutral-600 transition-colors hover:text-neutral-900"
            aria-label="Diminuer"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="p-2.5 text-neutral-600 transition-colors hover:text-neutral-900"
            aria-label="Augmenter"
            disabled={quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-sm text-neutral-500">
          {product.stock > 0
            ? `${product.stock} en stock`
            : "Rupture de stock"}
        </span>
      </div>

<div className="grid grid-cols-3 gap-2 rounded-2xl bg-pink-100 p-3">

  <div className="text-center">
    <Truck className="mx-auto h-6 w-6 text-pink-500" />
    <p className="mt-2 text-xs font-medium">
      Livraison rapide
    </p>
  </div>

  <div className="text-center">
    <CreditCard className="mx-auto h-6 w-6 text-pink-500" />
    <p className="mt-2 text-xs font-medium">
      Paiement à la livraison
    </p>
  </div>

  <div className="text-center">
    <ShieldCheck className="mx-auto h-6 w-6 text-pink-500" />
    <p className="mt-2 text-xs font-medium">
      Produit original
    </p>
  </div>

</div>

      <Button
        size="lg"
        className="w-full h-12 rounded-2xl bg-pink-600 hover:bg-pink-700"
        onClick={handleAddToCart}
        disabled={isOutOfStock || !allVariantsSelected || isPending}
        loading={isPending}
      >
        {added ? (
          <>
            <Check className="h-5 w-5" />
            Ajouté au panier
          </>
        ) : (
          <>
            <ShoppingBag className="h-5 w-5" />
            {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
          </>
        )}
      </Button>
    </div>
  );
}
