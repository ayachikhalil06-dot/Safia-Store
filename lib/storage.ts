const BUCKET = "product-images";

export function getStorageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !path) return "";
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Alias used across storefront and admin UI */
export const getImageUrlFromPath = getStorageUrl;
export const getImageUrl = getStorageUrl;

export function getAssetUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || !path) return "";
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export const STORAGE_BUCKETS = {
  products: "product-images",
  assets: "store-assets",
} as const;

export function generateImagePath(productId: string, filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${productId}/${unique}.${ext}`;
}
