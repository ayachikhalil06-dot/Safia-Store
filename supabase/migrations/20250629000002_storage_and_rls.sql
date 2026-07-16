-- ============================================================
-- Storage Buckets & Row Level Security
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES
-- ============================================================

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Public read store assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-assets');

CREATE POLICY "Admin manage store assets"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'store-assets');

-- ============================================================
-- ENABLE RLS
-- ============================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PUBLIC READ POLICIES (Storefront)
-- ============================================================

CREATE POLICY "Public read visible categories"
  ON categories FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Public read visible products"
  ON products FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Public read product images"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products p
      WHERE p.id = product_images.product_id AND p.is_visible = true
    )
  );

CREATE POLICY "Public read active shipping prices"
  ON shipping_prices FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Public read store settings"
  ON settings FOR SELECT
  USING (true);

-- ============================================================
-- PUBLIC INSERT POLICIES (Checkout)
-- ============================================================

CREATE POLICY "Public insert customers"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public insert order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- ADMIN POLICIES (Authenticated users = admins)
-- ============================================================

CREATE POLICY "Admin full access categories"
  ON categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access products"
  ON products FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access product images"
  ON product_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin full access orders"
  ON orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access order items"
  ON order_items FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access shipping"
  ON shipping_prices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin full access settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin can also read hidden products/categories for management
CREATE POLICY "Admin read all categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin read all products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin read all product images"
  ON product_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin read all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);
