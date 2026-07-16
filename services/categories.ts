import { createClient } from "@/lib/supabase/server";
import type { Category, CategoryFormData } from "@/types";

export async function getCategories(visibleOnly = true): Promise<Category[]> {
  const supabase = await createClient();

  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (visibleOnly) {
    query = query.eq("is_visible", true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();

  if (error || !data) return null;
  return data as Category;
}

export async function getAllCategoriesAdmin(): Promise<Category[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data || []) as Category[];
}

export async function createCategory(data: CategoryFormData): Promise<Category> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return category as Category;
}

export async function updateCategory(
  id: string,
  data: Partial<CategoryFormData>
): Promise<Category> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return category as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function toggleCategoryVisibility(
  id: string,
  isVisible: boolean
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_visible: isVisible })
    .eq("id", id);
  if (error) throw error;
}
