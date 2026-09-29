-- ============================================================================
-- Migration 014: only admins may change the catalogue and images
--
-- Found in QA on 2026-09-29. Email sign-up is enabled on the project, so
-- anyone can create an account, and these permissive policies let ANY
-- authenticated user:
--   * insert/update/delete products, skus, discovery_set_configs and
--     discovery_set_config_items (e.g. set every price to 1 leu)
--   * upload/overwrite/delete files in the product-images, brand-images and
--     discovery-sets-images buckets
-- Plus:
--   * products_import_stage had RLS disabled, so the public anon key could
--     read/modify/truncate it
--   * anyone could append order_items to ANY order, including paid ones
--
-- The "Admins can manage ..." (is_admin()) policies already cover admin
-- writes, so dropping the broad ones leaves admin access unchanged.
-- ============================================================================
BEGIN;

-- 1. Catalogue tables: drop every write policy that isn't admin-gated.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('products', 'skus', 'discovery_set_configs', 'discovery_set_config_items')
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
      AND coalesce(qual, '') || coalesce(with_check, '') NOT LIKE '%is_admin%'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

-- 2. Storage buckets: writes are admin-only (reads stay public).
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND cmd IN ('INSERT', 'UPDATE', 'DELETE')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Admins can upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('product-images', 'brand-images', 'discovery-sets-images') AND public.is_admin());

CREATE POLICY "Admins can update images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id IN ('product-images', 'brand-images', 'discovery-sets-images') AND public.is_admin())
WITH CHECK (bucket_id IN ('product-images', 'brand-images', 'discovery-sets-images') AND public.is_admin());

CREATE POLICY "Admins can delete images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id IN ('product-images', 'brand-images', 'discovery-sets-images') AND public.is_admin());

-- 3. Import staging table: service role only.
ALTER TABLE public.products_import_stage ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.products_import_stage FROM anon, authenticated;

-- 4. Order items can only be added to a fresh pending order (the checkout
--    inserts them right after the order). SECURITY DEFINER because guests
--    can't SELECT orders any more (migration 013).
CREATE OR REPLACE FUNCTION public.order_accepts_items(p_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orders
    WHERE id = p_order_id
      AND status = 'pending'
      AND created_at > now() - interval '1 hour'
  );
$$;
REVOKE ALL ON FUNCTION public.order_accepts_items(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.order_accepts_items(uuid) TO anon, authenticated;

DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'order_items' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.order_items', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Checkout can add items to a fresh pending order" ON order_items
FOR INSERT
WITH CHECK (public.order_accepts_items(order_id) OR public.is_admin());

-- 5. is_admin() is SECURITY DEFINER; pin its search_path.
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;

COMMIT;
