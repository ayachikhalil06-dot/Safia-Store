import { createClient } from "@/lib/supabase/server";
import { getStorageUrl } from "@/lib/storage";
import type { ProductWithImages, Product, ProductImage } from "@/types";

function mapProductImages(images: ProductImage[]) {
  return images.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getProducts(options?: {
  featured?: boolean;
  categorySlug?: string;
  limit?: number;
  offset?: number;
}): Promise<ProductWithImages[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*)
    `
    )
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (options?.featured) {
    query = query.eq("is_featured", true);
  }

  if (options?.categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.categorySlug)
      .single();

    if (category) {
      query = query.eq("category_id", category.id);
    }
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    price: Number(p.price),
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
    variants: p.variants || [],
    images: mapProductImages(p.images || []),
  })) as ProductWithImages[];
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*)
    `
    )
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    price: Number(data.price),
    compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
    variants: data.variants || [],
    images: mapProductImages(data.images || []),
  } as ProductWithImages;
}

export async function getProductImageUrl(product: ProductWithImages): Promise<string | null> {
  const primary = product.images.find((img) => img.is_primary) || product.images[0];
  if (!primary) return null;
  return getStorageUrl(primary.storage_path);
}

export async function searchProducts(query: string): Promise<ProductWithImages[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*)
    `
    )
    .eq("is_visible", true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    price: Number(p.price),
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
    variants: p.variants || [],
    images: mapProductImages(p.images || []),
  })) as ProductWithImages[];
}

export async function getAllProductsAdmin(): Promise<ProductWithImages[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((p) => ({
    ...p,
    price: Number(p.price),
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
    variants: p.variants || [],
    images: mapProductImages(p.images || []),
  })) as ProductWithImages[];
}

export async function getProductByIdAdmin(id: string): Promise<ProductWithImages | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      category:categories(*),
      images:product_images(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    price: Number(data.price),
    compare_at_price: data.compare_at_price ? Number(data.compare_at_price) : null,
    variants: data.variants || [],
    images: mapProductImages(data.images || []),
  } as ProductWithImages;
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at">
): Promise<Product> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "created_at" | "updated_at">>
): Promise<Product> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleProductVisibility(
  id: string,
  isVisible: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw error;
}

export async function getLowStockProducts(threshold = 5): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .lte("stock", threshold)
    .order("stock", { ascending: true });

  if (error) throw error;
  return (data || []).map((p) => ({
    ...p,
    price: Number(p.price),
    compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
  })) as Product[];
}
