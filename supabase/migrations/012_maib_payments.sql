-- ============================================================================
-- Migration 012: maib Checkout online payments
--
--   orders.payment_method  'offline' (confirm + pay via WhatsApp, the existing
--                          flow) | 'card' (paid online through maib Checkout)
--   payments               one row per maib checkout session. Written only by
--                          the Vercel Functions in /api/maib (service role);
--                          admins can read it.
--
-- Also tightens the public insert policy on orders: a guest may only create
-- an order in 'pending' status, so nobody can insert an order that already
-- claims to be 'paid'.
-- ============================================================================
BEGIN;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'offline';

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check CHECK (payment_method IN ('offline', 'card'));

-- The live DB accumulated six permissive INSERT policies on orders (all WITH
-- CHECK true, some misleadingly named *_order_items). Permissive policies are
-- OR-ed, so every one must go for the 'pending' rule to have any effect.
DO $$
DECLARE p record;
BEGIN
  FOR p IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.orders', p.policyname);
  END LOOP;
END $$;

CREATE POLICY "Anyone can create orders"
ON orders
FOR INSERT
TO public
WITH CHECK (status = 'pending' OR is_admin());

CREATE TABLE IF NOT EXISTS payments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider     text NOT NULL DEFAULT 'maib',
  checkout_id  text NOT NULL UNIQUE,
  checkout_url text,
  payment_id   text,
  amount_bani  integer NOT NULL CHECK (amount_bani > 0),
  currency     text NOT NULL DEFAULT 'MDL',
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  paid_at      timestamptz,
  refund_id    text,
  refunded_at  timestamptz,
  raw          jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_order_id_idx ON payments (order_id, created_at DESC);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read payments" ON payments;
CREATE POLICY "Admins can read payments"
ON payments
FOR SELECT
USING (is_admin());

-- No insert/update/delete policies: only the service role (Vercel Functions)
-- writes to this table.

COMMIT;
