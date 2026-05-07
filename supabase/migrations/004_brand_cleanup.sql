-- 004_brand_cleanup.sql
-- Data cleanup prior to price-list import.
-- Run in the Supabase SQL Editor. Wrapped in a transaction: review the
-- row counts in the output, then COMMIT (or ROLLBACK to abort).
--
-- What this does:
--   1. Fixes "Elisabethan Rose" -> "Elizabethan Rose" (Penhaligon's spelling typo).
--   2. Removes 3 duplicate products (and their 18 SKUs) created on 2026-01-19
--      with effectively empty descriptions. All duplicates have 0 order_items
--      and 0 discovery_set_config_items — verified before writing this file.
--   3. Consolidates fragmented brand strings:
--        Penhaligons                             -> Penhaligon's
--        By Kilian                               -> Kilian
--        TOM FORD Private Blend / TOM FORD Signature -> Tom Ford

BEGIN;

-- --- Step 1: typo fix -----------------------------------------------------
UPDATE products
   SET name = 'Elizabethan Rose',
       updated_at = now()
 WHERE brand = 'Penhaligons'
   AND name  = 'Elisabethan Rose';

-- --- Step 2: delete 3 duplicate products (and their SKUs) -----------------
-- Pre-verified: each of these had 6 SKUs, 0 order_items, 0 discovery_set_config_items.
DELETE FROM skus
 WHERE product_id IN (
   'edca2a19-0857-45a1-8bda-1b970b5b288f',  -- "Tom Ford" / Vanille Fatale   (dup of 67b3a02d in "TOM FORD Private Blend")
   '99bef4cc-6fd5-465c-b473-7c6108e6f9d1',  -- "Tom Ford" / Neroli Portofino (dup of 9f32c460 in "TOM FORD Private Blend")
   '5ab35e49-bd82-4de7-9666-590e008cbee0'   -- "Penhaligon's" / Cairo         (dup of 252dd255 in "Penhaligons")
 );

DELETE FROM products
 WHERE id IN (
   'edca2a19-0857-45a1-8bda-1b970b5b288f',
   '99bef4cc-6fd5-465c-b473-7c6108e6f9d1',
   '5ab35e49-bd82-4de7-9666-590e008cbee0'
 );

-- --- Step 3: brand string consolidation -----------------------------------
UPDATE products
   SET brand = 'Penhaligon''s',
       updated_at = now()
 WHERE brand = 'Penhaligons';

UPDATE products
   SET brand = 'Kilian',
       updated_at = now()
 WHERE brand = 'By Kilian';

UPDATE products
   SET brand = 'Tom Ford',
       updated_at = now()
 WHERE brand IN ('TOM FORD Private Blend', 'TOM FORD Signature');

-- --- Verification (read-only; run before COMMIT) --------------------------
-- Expected after cleanup:
--   no row with name = 'Elisabethan Rose'
--   no brand in ('Penhaligons','By Kilian','TOM FORD Private Blend','TOM FORD Signature')
--   no (brand, name) duplicate in the affected brands
SELECT brand, COUNT(*) AS product_count
  FROM products
 WHERE brand IN ('Penhaligon''s','Kilian','Tom Ford','Stephane Humbert Lucas 777')
 GROUP BY brand
 ORDER BY brand;

SELECT brand, name, COUNT(*) AS copies
  FROM products
 WHERE brand IN ('Penhaligon''s','Kilian','Tom Ford')
 GROUP BY brand, name
HAVING COUNT(*) > 1;   -- must return 0 rows

COMMIT;
-- If anything looked off above, replace COMMIT with ROLLBACK and investigate.
