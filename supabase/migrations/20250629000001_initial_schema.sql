-- ============================================================
-- E-commerce Store - Initial Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

CREATE TYPE payment_method AS ENUM (
  'cod'
);

-- ============================================================
-- CATEGORIES
-- ============================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_visible ON categories(is_visible);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(12, 2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(12, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku TEXT,
  badge TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_visible ON products(is_visible);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_created ON products(created_at DESC);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_sort ON product_images(product_id, sort_order);

-- ============================================================
-- CUSTOMERS
-- ============================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  wilaya TEXT NOT NULL,
  wilaya_code INTEGER,
  commune TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_created ON customers(created_at DESC);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  status order_status NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
  payment_method payment_method NOT NULL DEFAULT 'cod',
  notes TEXT,
  yalidine_tracking_id TEXT,
  yalidine_label_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================================
-- ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_slug TEXT,
  variant JSONB NOT NULL DEFAULT '{}'::jsonb,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(12, 2) NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- SHIPPING PRICES (by Wilaya)
-- ============================================================

CREATE TABLE shipping_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wilaya_code INTEGER NOT NULL UNIQUE,
  wilaya_name TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  delivery_days_min INTEGER,
  delivery_days_max INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipping_wilaya ON shipping_prices(wilaya_code);
CREATE INDEX idx_shipping_active ON shipping_prices(is_active);

-- ============================================================
-- REVIEWS (admin-managed only)
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_visible ON reviews(is_visible);
CREATE INDEX idx_reviews_order ON reviews(order_id);

-- ============================================================
-- SETTINGS (key-value store configuration)
-- ============================================================

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_settings_key ON settings(key);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_shipping_prices_updated_at
  BEFORE UPDATE ON shipping_prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_settings_updated_at
  BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ORDER NUMBER GENERATOR
-- ============================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    new_number := 'CMD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = new_number) INTO exists_check;
    EXIT WHEN NOT exists_check;
  END LOOP;
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEED: Default settings (empty store config)
-- ============================================================

INSERT INTO settings (key, value) VALUES
  ('store', '{"name":"","tagline":"","description":"","email":"","phone":"","address":"","currency":"DZD","logo_url":null,"favicon_url":null,"social":{}}'::jsonb),
  ('seo', '{"title":"","description":"","keywords":""}'::jsonb),
  ('checkout', '{"min_order_amount":0,"allow_notes":true,"cod_enabled":true}'::jsonb),
  ('yalidine', '{"enabled":false,"from_wilaya":"","from_commune":""}'::jsonb);

-- ============================================================
-- SEED: Algeria Wilayas shipping (prices at 0, admin configures)
-- ============================================================

INSERT INTO shipping_prices (wilaya_code, wilaya_name, price, is_active) VALUES
  (1, 'Adrar', 0, true),
  (2, 'Chlef', 0, true),
  (3, 'Laghouat', 0, true),
  (4, 'Oum El Bouaghi', 0, true),
  (5, 'Batna', 0, true),
  (6, 'Béjaïa', 0, true),
  (7, 'Biskra', 0, true),
  (8, 'Béchar', 0, true),
  (9, 'Blida', 0, true),
  (10, 'Bouira', 0, true),
  (11, 'Tamanrasset', 0, true),
  (12, 'Tébessa', 0, true),
  (13, 'Tlemcen', 0, true),
  (14, 'Tiaret', 0, true),
  (15, 'Tizi Ouzou', 0, true),
  (16, 'Alger', 0, true),
  (17, 'Djelfa', 0, true),
  (18, 'Jijel', 0, true),
  (19, 'Sétif', 0, true),
  (20, 'Saïda', 0, true),
  (21, 'Skikda', 0, true),
  (22, 'Sidi Bel Abbès', 0, true),
  (23, 'Annaba', 0, true),
  (24, 'Guelma', 0, true),
  (25, 'Constantine', 0, true),
  (26, 'Médéa', 0, true),
  (27, 'Mostaganem', 0, true),
  (28, 'M''Sila', 0, true),
  (29, 'Mascara', 0, true),
  (30, 'Ouargla', 0, true),
  (31, 'Oran', 0, true),
  (32, 'El Bayadh', 0, true),
  (33, 'Illizi', 0, true),
  (34, 'Bordj Bou Arréridj', 0, true),
  (35, 'Boumerdès', 0, true),
  (36, 'El Tarf', 0, true),
  (37, 'Tindouf', 0, true),
  (38, 'Tissemsilt', 0, true),
  (39, 'El Oued', 0, true),
  (40, 'Khenchela', 0, true),
  (41, 'Souk Ahras', 0, true),
  (42, 'Tipaza', 0, true),
  (43, 'Mila', 0, true),
  (44, 'Aïn Defla', 0, true),
  (45, 'Naâma', 0, true),
  (46, 'Aïn Témouchent', 0, true),
  (47, 'Ghardaïa', 0, true),
  (48, 'Relizane', 0, true),
  (49, 'Timimoun', 0, true),
  (50, 'Bordj Badji Mokhtar', 0, true),
  (51, 'Ouled Djellal', 0, true),
  (52, 'Béni Abbès', 0, true),
  (53, 'In Salah', 0, true),
  (54, 'In Guezzam', 0, true),
  (55, 'Touggourt', 0, true),
  (56, 'Djanet', 0, true),
  (57, 'El M''Ghair', 0, true),
  (58, 'El Meniaa', 0, true);
