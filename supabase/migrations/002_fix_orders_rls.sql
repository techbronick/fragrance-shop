-- Migration: Fix Orders RLS Policy
-- This migration fixes the RLS policy for orders table to ensure inserts work correctly

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Recreate the policy with explicit role specification
-- This allows both authenticated and anonymous users to create orders
CREATE POLICY "Anyone can create orders"
ON orders
FOR INSERT
TO public
WITH CHECK (true);
