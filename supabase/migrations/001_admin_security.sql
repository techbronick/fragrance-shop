-- Migration: Admin Security with RLS
-- This migration sets up admin user management and Row Level Security policies

-- ============================================
-- 1. Create admin_users table
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users (circular dependency handled by service role)
CREATE POLICY "Service role can manage admin_users"
ON admin_users
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Users can check if they are admin
CREATE POLICY "Users can check own admin status"
ON admin_users
FOR SELECT
USING (auth.uid() = user_id);

-- ============================================
-- 2. Create helper function to check admin status
-- ============================================
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Enable RLS on products table
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Public can read products
CREATE POLICY "Public can read products"
ON products
FOR SELECT
USING (true);

-- Only admins can insert/update/delete products
CREATE POLICY "Admins can manage products"
ON products
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- 4. Enable RLS on skus table
-- ============================================
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read skus" ON skus;
DROP POLICY IF EXISTS "Admins can manage skus" ON skus;

-- Public can read skus
CREATE POLICY "Public can read skus"
ON skus
FOR SELECT
USING (true);

-- Only admins can insert/update/delete skus
CREATE POLICY "Admins can manage skus"
ON skus
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- 5. Enable RLS on discovery_set_configs table
-- ============================================
ALTER TABLE discovery_set_configs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read discovery sets" ON discovery_set_configs;
DROP POLICY IF EXISTS "Admins can manage discovery sets" ON discovery_set_configs;

-- Public can read active discovery sets
CREATE POLICY "Public can read active discovery sets"
ON discovery_set_configs
FOR SELECT
USING (is_active = true OR is_admin());

-- Only admins can insert/update/delete discovery sets
CREATE POLICY "Admins can manage discovery sets"
ON discovery_set_configs
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- 6. Enable RLS on discovery_set_config_items table
-- ============================================
ALTER TABLE discovery_set_config_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read discovery set items" ON discovery_set_config_items;
DROP POLICY IF EXISTS "Admins can manage discovery set items" ON discovery_set_config_items;

-- Public can read items for active configs
CREATE POLICY "Public can read discovery set items"
ON discovery_set_config_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM discovery_set_configs
    WHERE discovery_set_configs.id = discovery_set_config_items.config_id
    AND (discovery_set_configs.is_active = true OR is_admin())
  )
);

-- Only admins can insert/update/delete items
CREATE POLICY "Admins can manage discovery set items"
ON discovery_set_config_items
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- ============================================
-- 7. Enable RLS on orders table
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
ON orders
FOR SELECT
USING (auth.uid() = user_id OR is_admin());

-- Anyone can create orders (for checkout)
CREATE POLICY "Anyone can create orders"
ON orders
FOR INSERT
WITH CHECK (true);

-- Only admins can update orders
CREATE POLICY "Admins can update orders"
ON orders
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete orders
CREATE POLICY "Admins can delete orders"
ON orders
FOR DELETE
USING (is_admin());

-- ============================================
-- 8. Enable RLS on order_items table
-- ============================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Admins can update order items" ON order_items;
DROP POLICY IF EXISTS "Admins can delete order items" ON order_items;

-- Users can view items for their own orders
CREATE POLICY "Users can view own order items"
ON order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR is_admin())
  )
);

-- Anyone can create order items (when creating an order)
CREATE POLICY "Anyone can create order items"
ON order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
  )
);

-- Only admins can update order items
CREATE POLICY "Admins can update order items"
ON order_items
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

-- Only admins can delete order items
CREATE POLICY "Admins can delete order items"
ON order_items
FOR DELETE
USING (is_admin());

-- ============================================
-- 9. Enable RLS on discovery_recommendations table
-- ============================================
ALTER TABLE discovery_recommendations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own recommendations" ON discovery_recommendations;
DROP POLICY IF EXISTS "Admins can manage recommendations" ON discovery_recommendations;

-- Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
ON discovery_recommendations
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL OR is_admin());

-- Anyone can create recommendations (for quiz)
CREATE POLICY "Anyone can create recommendations"
ON discovery_recommendations
FOR INSERT
WITH CHECK (true);

-- Only admins can update/delete recommendations
CREATE POLICY "Admins can manage recommendations"
ON discovery_recommendations
FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete recommendations"
ON discovery_recommendations
FOR DELETE
USING (is_admin());

-- ============================================
-- 10. Storage policies for product images
-- ============================================
-- Note: These need to be created in Supabase Dashboard → Storage → Policies
-- Or via Supabase CLI if you have it set up
-- 
-- For bucket 'product-images':
-- 
-- Policy: "Public can read images"
-- SELECT: bucket_id = 'product-images'
-- 
-- Policy: "Admins can upload images"
-- INSERT: bucket_id = 'product-images' AND is_admin()
-- 
-- Policy: "Admins can update images"
-- UPDATE: bucket_id = 'product-images' AND is_admin()
-- 
-- Policy: "Admins can delete images"
-- DELETE: bucket_id = 'product-images' AND is_admin()

-- ============================================
-- 11. Create index for better performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- ============================================
-- 12. Add trigger to update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
