"use server";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductVisibility,
} from "@/services/products";
import {
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
} from "@/services/images";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryVisibility,
} from "@/services/categories";
import { updateOrderStatus } from "@/services/orders";
import { updateShippingPrice, bulkUpdateShippingPrices } from "@/services/shipping";
import {
  updateSetting,
  createReview,
  updateReview,
  deleteReview,
  toggleReviewVisibility,
} from "@/services/settings";
import { yalidineService } from "@/services/yalidine";
import { getOrderById } from "@/services/orders";
import { getYalidineSettings } from "@/services/settings";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  ProductFormData,
  CategoryFormData,
  OrderStatus,
  ReviewFormData,
} from "@/types";

export async function createProductAction(data: ProductFormData) {
  try {
    const product = await createProduct({
      ...data,
      metadata: {},
    });
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur",
    };
  }
}

export async function updateProductAction(id: string, data: Partial<ProductFormData>) {
  try {
    const product = await updateProduct(id, data);
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/admin/products");
    return { success: true, product };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur",
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await deleteProduct(id);
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur",
    };
  }
}

export async function toggleProductVisibilityAction(id: string, isVisible: boolean) {
  try {
    await toggleProductVisibility(id, isVisible);
    revalidatePath("/");
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function uploadImageAction(productId: string, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const altText = formData.get("altText") as string;
    const image = await uploadProductImage(productId, file, altText);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/");
    return { success: true, image };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function deleteImageAction(imageId: string, productId: string) {
  try {
    await deleteProductImage(imageId);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function reorderImagesAction(productId: string, imageIds: string[]) {
  try {
    await reorderProductImages(productId, imageIds);
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function createCategoryAction(data: CategoryFormData) {
  try {
    const category = await createCategory(data);
    revalidatePath("/");
    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function updateCategoryAction(id: string, data: Partial<CategoryFormData>) {
  try {
    const category = await updateCategory(id, data);
    revalidatePath("/");
    revalidatePath("/admin/categories");
    return { success: true, category };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await deleteCategory(id);
    revalidatePath("/");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function toggleCategoryVisibilityAction(id: string, isVisible: boolean) {
  try {
    await toggleCategoryVisibility(id, isVisible);
    revalidatePath("/");
    revalidatePath("/admin/categories");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function updateOrderStatusAction(id: string, status: OrderStatus) {
  try {
    await updateOrderStatus(id, status);
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function updateShippingPriceAction(
  id: string,
  price: number,
  isActive?: boolean
) {
  try {
    await updateShippingPrice(id, { price, ...(isActive !== undefined && { is_active: isActive }) });
    revalidatePath("/admin/shipping");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function bulkUpdateShippingAction(
  updates: { id: string; price: number }[]
) {
  try {
    await bulkUpdateShippingPrices(updates);
    revalidatePath("/admin/shipping");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function updateStoreSettingsAction(value: Record<string, unknown>) {
  try {
    await updateSetting("store", value);
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function updateSeoSettingsAction(value: Record<string, unknown>) {
  try {
    await updateSetting("seo", value);
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function updateCheckoutSettingsAction(value: Record<string, unknown>) {
  try {
    await updateSetting("checkout", value);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function updateYalidineSettingsAction(value: Record<string, unknown>) {
  try {
    await updateSetting("yalidine", value);
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function createReviewAction(data: ReviewFormData) {
  try {
    const review = await createReview(data);
    revalidatePath("/admin/reviews");
    return { success: true, review };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function updateReviewAction(id: string, data: Partial<ReviewFormData>) {
  try {
    const review = await updateReview(id, data);
    revalidatePath("/admin/reviews");
    return { success: true, review };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function deleteReviewAction(id: string) {
  try {
    await deleteReview(id);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function toggleReviewVisibilityAction(id: string, isVisible: boolean) {
  try {
    await toggleReviewVisibility(id, isVisible);
    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function createYalidineParcelAction(orderId: string) {
  try {
    const order = await getOrderById(orderId);
    if (!order) return { success: false, error: "Commande introuvable." };

    const settings = await getYalidineSettings();
    const result = await yalidineService.createParcel(order, settings);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const supabase = await createClient();
    await supabase
      .from("orders")
      .update({
        yalidine_tracking_id: result.tracking,
        yalidine_label_url: result.label,
      })
      .eq("id", orderId);

    revalidatePath("/admin/orders");
    return { success: true, tracking: result.tracking };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Erreur" };
  }
}

export async function getDashboardStatsAction() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: visibleProducts },
    { data: orders },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_visible", true),
    supabase.from("orders").select("total, status, created_at"),
    supabase.from("products").select("id").lte("stock", 5),
  ]);

  const allOrders = orders || [];
  const revenueOrders = allOrders.filter((o) =>
    ["delivered", "shipped", "processing", "confirmed"].includes(o.status)
  );

  return {
    totalRevenue: revenueOrders.reduce((sum, o) => sum + Number(o.total), 0),
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter((o) => o.status === "pending").length,
    totalProducts: totalProducts || 0,
    visibleProducts: visibleProducts || 0,
    lowStockProducts: lowStock?.length || 0,
  };
}
