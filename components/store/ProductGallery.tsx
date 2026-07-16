"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import type { ProductImage } from "@/types";
import { getImageUrlFromPath } from "@/lib/storage";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const [activeIndex, setActiveIndex] = useState(0);

  if (sorted.length === 0) {
    return (
      <div className="h-[430px] w-full rounded-3xl object-cover">
        <span className="text-neutral-400 text-sm">Aucune image</span>
      </div>
    );
  }

  const activeImage = sorted[activeIndex];

  return (
    <div className="space-y-4">
      <div className="relative h-[430px] overflow-hidden rounded-3xl bg-pink-100">
        <Image
          src={getImageUrlFromPath(activeImage.storage_path)}
          alt={activeImage.alt_text || productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover rounded-3xl transition-all duration-300"
          priority
        />
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
               "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 shadow-sm transition-all duration-200",
                index === activeIndex
                  ? "border-neutral-900"
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={getImageUrlFromPath(img.storage_path)}
                alt={img.alt_text || `${productName} ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
