"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Upload, Trash2, Star, GripVertical } from "lucide-react";
import type { ProductImage } from "@/types";
import {
  uploadImageAction,
  deleteImageAction,
  reorderImagesAction,
} from "@/app/actions/admin";
import { getImageUrl } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface ImageManagerProps {
  productId: string;
  images: ProductImage[];
}

export function ImageManager({ productId, images: initialImages }: ImageManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [isPending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    startTransition(async () => {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImageAction(productId, formData);
        if (result.success && result.image) {
          setImages((prev) => [...prev, result.image!]);
        }
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (imageId: string) => {
    startTransition(async () => {
      const result = await deleteImageAction(imageId, productId);
      if (result.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    });
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newImages = [...images];
    const [dragged] = newImages.splice(dragIndex, 1);
    newImages.splice(index, 0, dragged);
    setImages(newImages);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    if (dragIndex !== null) {
      startTransition(async () => {
        await reorderImagesAction(
          productId,
          images.map((img) => img.id)
        );
      });
    }
    setDragIndex(null);
  };

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-neutral-900">Photos</h2>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            loading={isPending}
          >
            <Upload className="h-4 w-4" />
            Ajouter des photos
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div
          className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 py-12 cursor-pointer hover:border-neutral-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-neutral-400" />
          <p className="mt-2 text-sm text-neutral-500">
            Glissez ou cliquez pour uploader
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {sorted.map((img, index) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100",
                dragIndex === index && "opacity-50"
              )}
            >
              <Image
                src={getImageUrl(img.storage_path)}
                alt={img.alt_text || "Product image"}
                fill
                sizes="200px"
                className="object-cover"
              />
              {img.is_primary && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-medium text-white">
                  <Star className="h-3 w-3" />
                  Principale
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <GripVertical className="h-5 w-5 text-white cursor-grab" />
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
