-- ============================================================================
-- Migration 011: Prepare schema for Fragrantica enrichment parser
--
--   gender         text   — 'male' | 'female' | 'unisex' | NULL
--   last_parsed_at timestamptz — resumability key; NULL = never parsed
--
-- Backfill: rows currently flagged gender_neutral=true get 'unisex'. The
-- rest stay NULL until the parser fills them. gender_neutral column is NOT
-- dropped — frontend still reads it; that's a follow-up migration after the
-- frontend is updated to read `gender`.
-- ============================================================================
BEGIN;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gender         text,
  ADD COLUMN IF NOT EXISTS last_parsed_at timestamptz;

UPDATE products
   SET gender = 'unisex'
 WHERE gender_neutral = true
   AND gender IS NULL;

COMMIT;
