import { createClient } from "@/lib/supabase/server";
import type { ShippingPrice } from "@/types";

export async function getShippingPrices(): Promise<ShippingPrice[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shipping_prices")
    .select("*")
    .eq("is_active", true)
    .order("wilaya_code", { ascending: true });

  if (error) throw error;

  return (data || []).map((s) => ({
    ...s,
    price: Number(s.price),
  })) as ShippingPrice[];
}

export async function getAllShippingPricesAdmin(): Promise<ShippingPrice[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shipping_prices")
    .select("*")
    .order("wilaya_code", { ascending: true });

  if (error) throw error;

  return (data || []).map((s) => ({
    ...s,
    price: Number(s.price),
  })) as ShippingPrice[];
}

export async function getShippingPriceByWilaya(
  wilayaCode: number
): Promise<ShippingPrice | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shipping_prices")
    .select("*")
    .eq("wilaya_code", wilayaCode)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;

  return { ...data, price: Number(data.price) } as ShippingPrice;
}

export async function updateShippingPrice(
  id: string,
  updates: Partial<Pick<ShippingPrice, "price" | "is_active" | "delivery_days_min" | "delivery_days_max">>
): Promise<ShippingPrice> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shipping_prices")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return { ...data, price: Number(data.price) } as ShippingPrice;
}

export async function bulkUpdateShippingPrices(
  updates: { id: string; price: number; is_active?: boolean }[]
): Promise<void> {
  const supabase = await createClient();

  await Promise.all(
    updates.map(({ id, price, is_active }) =>
      supabase
        .from("shipping_prices")
        .update({ price, ...(is_active !== undefined && { is_active }) })
        .eq("id", id)
    )
  );
}
