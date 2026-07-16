export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod";

export interface ProductVariant {
  id: string;
  name: string;
  type: "color" | "model" | "size" | "other";
  value: string;
  hex?: string;
  price_adjustment?: number;
  stock?: number;
  sku?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string | null;
  badge: string | null;
  is_visible: boolean;
  is_featured: boolean;
  category_id: string | null;
  variants: ProductVariant[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface ProductWithImages extends Product {
  images: ProductImage[];
  category?: Category | null;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  wilaya: string;
  wilaya_code: number | null;
  commune: string;
  address: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: PaymentMethod;
  notes: string | null;
  yalidine_tracking_id: string | null;
  yalidine_label_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_slug: string | null;
  variant: Record<string, unknown>;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface OrderWithDetails extends Order {
  customer: Customer;
  items: OrderItem[];
}

export interface ShippingPrice {
  id: string;
  wilaya_code: number;
  wilaya_name: string;
  price: number;
  is_active: boolean;
  delivery_days_min: number | null;
  delivery_days_max: number | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  order_id: string | null;
  customer_name: string;
  rating: number;
  title: string | null;
  content: string;
  is_visible: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithProduct extends Review {
  product?: Pick<Product, "id" | "name" | "slug">;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  logo_url: string | null;
  favicon_url: string | null;
  social: Record<string, string>;
}

export interface SeoSettings {
  title: string;
  description: string;
  keywords: string;
}

export interface CheckoutSettings {
  min_order_amount: number;
  allow_notes: boolean;
  cod_enabled: boolean;
}

export interface YalidineSettings {
  enabled: boolean;
  from_wilaya: string;
  from_commune: string;
}

export interface Setting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  variant: Record<string, string>;
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
}

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  wilaya: string;
  wilayaCode: number;
  commune: string;
  address: string;
  notes: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  visibleProducts: number;
  lowStockProducts: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: OrderStatus; count: number }[];
  topProducts: { product_id: string; product_name: string; total_sold: number; revenue: number }[];
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  sku: string;
  badge: string | null;
  is_visible: boolean;
  is_featured: boolean;
  category_id: string | null;
  variants: ProductVariant[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_visible: boolean;
}

export interface ReviewFormData {
  product_id: string;
  order_id: string | null;
  customer_name: string;
  rating: number;
  title: string;
  content: string;
  is_visible: boolean;
  is_verified: boolean;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};
