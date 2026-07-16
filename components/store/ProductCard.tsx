import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ProductWithImages } from "@/types";
import { getImageUrlFromPath } from "@/lib/storage";
import { formatPrice } from "@/utils/format";
import { getDiscountPercentage } from "@/utils/helpers";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

interface ProductCardProps {
  product: ProductWithImages;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage =
    product.images.find((img) => img.is_primary) || product.images[0];
  const imageUrl = primaryImage
    ? getImageUrlFromPath(primaryImage.storage_path)
    : null;
  const discount = getDiscountPercentage(product.price, product.compare_at_price);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-3xl bg-[#F3F4F6]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={primaryImage?.alt_text || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 transition-all duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <span className="text-sm">Aucune image</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.badge && (
            <Badge variant="new">{product.badge}</Badge>
          )}
          {discount && (
            <Badge variant="sale">-{discount}%</Badge>
          )}
        </div>

        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-white">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        {product.category && (
          <p className="text-xs text-neutral-500">{product.category.name}</p>
        )}
        <h3 className="text-base font-medium text-neutral-900 line-clamp-2 group-hover:underline underline-offset-2">
  {product.name}
</h3>

<div className="flex items-center gap-1 my-2">
  {[1,2,3,4,5].map((i) => (
    <Star
      key={i}
      size={14}
      className="fill-yellow-400 text-yellow-400"
    />
  ))}
  <span className="ml-1 text-xs text-gray-500">(5.0)</span>
</div>

<div className="flex items-center gap-2">
  <span className={cn("text-xl font-bold text-pink-600", discount && "text-red-600")}>
    {formatPrice(product.price)}
  </span>
          {product.compare_at_price && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(product.compare_at_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
