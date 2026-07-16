import { createClient } from "@/lib/supabase/server";
import type {
  Order,
  OrderItem,
  OrderWithDetails,
  OrderStatus,
  Customer,
  CheckoutFormData,
  CartItem,
} from "@/types";

export async function createOrder(
  formData: CheckoutFormData,
  items: CartItem[],
  shippingCost: number
): Promise<Order> {
  const supabase = await createClient();

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const total = subtotal + shippingCost;

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .insert({
      full_name: formData.fullName,
      phone: formData.phone,
      wilaya: formData.wilaya,
      wilaya_code: formData.wilayaCode,
      commune: formData.commune,
      address: formData.address,
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (customerError) throw customerError;

  const orderNumber = `CMD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      customer_id: customer.id,
      status: "pending",
      subtotal,
      shipping_cost: shippingCost,
      total,
      payment_method: "cod",
      notes: formData.notes || null,
    })
    .select()
    .single();

  if (orderError) throw orderError;

  const orderItems = items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    product_name: item.name,
    product_slug: item.slug,
    variant: item.variant,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock")
      .eq("id", item.productId)
      .single();

    if (product) {
      await supabase
        .from("products")
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq("id", item.productId);
    }
  }

  return {
    ...order,
    subtotal: Number(order.subtotal),
    shipping_cost: Number(order.shipping_cost),
    total: Number(order.total),
  } as Order;
}

export async function getOrders(options?: {
  status?: OrderStatus;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<OrderWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(*),
      items:order_items(*)
    `
    )
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 20) - 1
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  let orders = (data || []).map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    shipping_cost: Number(o.shipping_cost),
    total: Number(o.total),
    items: (o.items || []).map((i: OrderItem) => ({
      ...i,
      unit_price: Number(i.unit_price),
      total_price: Number(i.total_price),
    })),
  })) as OrderWithDetails[];

  if (options?.search) {
    const search = options.search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(search) ||
        o.customer.full_name.toLowerCase().includes(search) ||
        o.customer.phone.includes(search)
    );
  }

  return orders;
}

export async function getOrderById(id: string): Promise<OrderWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      customer:customers(*),
      items:order_items(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    subtotal: Number(data.subtotal),
    shipping_cost: Number(data.shipping_cost),
    total: Number(data.total),
    items: (data.items || []).map((i: OrderItem) => ({
      ...i,
      unit_price: Number(i.unit_price),
      total_price: Number(i.total_price),
    })),
  } as OrderWithDetails;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function getOrderStats(): Promise<{
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
}> {
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("total, status");

  if (error) throw error;

  const allOrders = orders || [];
  const deliveredOrders = allOrders.filter(
    (o) => o.status === "delivered" || o.status === "shipped"
  );

  return {
    totalRevenue: deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0),
    totalOrders: allOrders.length,
    pendingOrders: allOrders.filter((o) => o.status === "pending").length,
  };
}

export async function getRevenueByDay(days = 30): Promise<
  { date: string; revenue: number; orders: number }[]
> {
  const supabase = await createClient();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("orders")
    .select("total, created_at, status")
    .gte("created_at", startDate.toISOString())
    .in("status", ["delivered", "shipped", "processing", "confirmed"]);

  if (error) throw error;

  const grouped: Record<string, { revenue: number; orders: number }> = {};

  (data || []).forEach((order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0];
    if (!grouped[date]) grouped[date] = { revenue: 0, orders: 0 };
    grouped[date].revenue += Number(order.total);
    grouped[date].orders += 1;
  });

  return Object.entries(grouped)
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTopProducts(limit = 5): Promise<
  { product_id: string; product_name: string; total_sold: number; revenue: number }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_items")
    .select("product_id, product_name, quantity, total_price");

  if (error) throw error;

  const grouped: Record<
    string,
    { product_name: string; total_sold: number; revenue: number }
  > = {};

  (data || []).forEach((item) => {
    const id = item.product_id || item.product_name;
    if (!grouped[id]) {
      grouped[id] = {
        product_name: item.product_name,
        total_sold: 0,
        revenue: 0,
      };
    }
    grouped[id].total_sold += item.quantity;
    grouped[id].revenue += Number(item.total_price);
  });

  return Object.entries(grouped)
    .map(([product_id, stats]) => ({ product_id, ...stats }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getOrdersByStatus(): Promise<
  { status: OrderStatus; count: number }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("orders").select("status");
  if (error) throw error;

  const grouped: Record<string, number> = {};
  (data || []).forEach((o) => {
    grouped[o.status] = (grouped[o.status] || 0) + 1;
  });

  return Object.entries(grouped).map(([status, count]) => ({
    status: status as OrderStatus,
    count,
  }));
}
