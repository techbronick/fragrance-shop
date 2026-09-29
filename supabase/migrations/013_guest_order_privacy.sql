-- ============================================================================
-- Migration 013: stop exposing guest orders to the public (anon) key
--
-- The SELECT policies on orders / order_items allowed `user_id IS NULL`, so
-- anyone holding the anon key (it ships in the site's JS) could list every
-- guest order: names, emails, phones, addresses.
--
-- Guests now read their order through /api/orders?id=<uuid> (service role,
-- the UUID is the capability), and checkout no longer reads back its insert.
-- APPLY ONLY AFTER that frontend is deployed, or guest order pages break.
-- ============================================================================
BEGIN;

-- Drop every SELECT policy on both tables (the live DB has drifted from the
-- migration files before), then recreate the owner/admin rule.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT tablename, policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename IN ('orders', 'order_items') AND cmd = 'SELECT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

CREATE POLICY "Users can view own orders"
ON orders
FOR SELECT
USING (auth.uid() = user_id OR is_admin());

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

COMMIT;
