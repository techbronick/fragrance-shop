-- Migration: Add stock_volume column to products table
-- This column tracks the total available perfume volume in milliliters

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS stock_volume INTEGER DEFAULT 0;

-- Ensure non-negative values
ALTER TABLE products 
ADD CONSTRAINT products_stock_volume_non_negative 
CHECK (stock_volume >= 0);

-- Add comment
COMMENT ON COLUMN products.stock_volume IS 'Total available stock volume in milliliters';
