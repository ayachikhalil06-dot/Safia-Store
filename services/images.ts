import { createClient } from "@/lib/supabase/server";
import { generateImagePath, STORAGE_BUCKETS } from "@/lib/storage";
import type { ProductImage } from "@/types";

export async function getProductImages(productId: string): Promise<ProductImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as ProductImage[];
}

export async function uploadProductImage(
  productId: string,
  file: File,
  altText?: string
): Promise<ProductImage> {
  const supabase = await createClient();
  const path = generateImagePath(productId, file.name);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.products)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data: existingImages } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId);

  const isPrimary = !existingImages || existingImages.length === 0;

  const { data: maxSort } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const sortOrder = maxSort ? maxSort.sort_order + 1 : 0;

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      storage_path: path,
      alt_text: altText || null,
      sort_order: sortOrder,
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProductImage;
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = await createClient();

  const { data: image, error: fetchError } = await supabase
    .from("product_images")
    .select("*")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) throw fetchError || new Error("Image not found");

  await supabase.storage
    .from(STORAGE_BUCKETS.products)
    .remove([image.storage_path]);

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) throw error;

  if (image.is_primary) {
    const { data: remaining } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", image.product_id)
      .order("sort_order", { ascending: true })
      .limit(1)
      .single();

    if (remaining) {
      await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", remaining.id);
    }
  }
}

export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<void> {
  const supabase = await createClient();

  const updates = imageIds.map((id, index) =>
    supabase
      .from("product_images")
      .update({ sort_order: index, is_primary: index === 0 })
      .eq("id", id)
      .eq("product_id", productId)
  );

  await Promise.all(updates);
}

export async function setPrimaryImage(
  productId: string,
  imageId: string
): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) throw error;
}
