import { createClient } from "@/lib/supabase/server";
import type {
  StoreSettings,
  SeoSettings,
  CheckoutSettings,
  YalidineSettings,
  Review,
  ReviewWithProduct,
  ReviewFormData,
} from "@/types";

export async function getSetting<T>(key: string): Promise<T | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) return null;
  return data.value as T;
}

export async function updateSetting(
  key: string,
  value: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) throw error;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const settings = await getSetting<StoreSettings>("store");
  return (
    settings || {
      name: "",
      tagline: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      currency: "DZD",
      logo_url: null,
      favicon_url: null,
      social: {},
    }
  );
}

export async function getSeoSettings(): Promise<SeoSettings> {
  const settings = await getSetting<SeoSettings>("seo");
  return settings || { title: "", description: "", keywords: "" };
}

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  const settings = await getSetting<CheckoutSettings>("checkout");
  return (
    settings || {
      min_order_amount: 0,
      allow_notes: true,
      cod_enabled: true,
    }
  );
}

export async function getYalidineSettings(): Promise<YalidineSettings> {
  const settings = await getSetting<YalidineSettings>("yalidine");
  return (
    settings || {
      enabled: false,
      from_wilaya: "",
      from_commune: "",
    }
  );
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Review[];
}

export async function getAllReviewsAdmin(): Promise<ReviewWithProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      product:products(id, name, slug)
    `
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ReviewWithProduct[];
}

export async function createReview(data: ReviewFormData): Promise<Review> {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("reviews")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return review as Review;
}

export async function updateReview(
  id: string,
  data: Partial<ReviewFormData>
): Promise<Review> {
  const supabase = await createClient();

  const { data: review, error } = await supabase
    .from("reviews")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return review as Review;
}

export async function deleteReview(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleReviewVisibility(
  id: string,
  isVisible: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw error;
}

export async function getProductRatingStats(productId: string): Promise<{
  average: number;
  count: number;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_visible", true);

  if (error || !data || data.length === 0) {
    return { average: 0, count: 0 };
  }

  const total = data.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: Math.round((total / data.length) * 10) / 10,
    count: data.length,
  };
}
