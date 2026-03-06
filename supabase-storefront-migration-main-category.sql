-- Main category for shop sections (Homme / Femme / Enfant)
-- Run in Supabase SQL Editor after supabase-storefront.sql

ALTER TABLE products
ADD COLUMN IF NOT EXISTS main_category text NOT NULL DEFAULT 'homme';

-- Optional: backfill existing rows (already defaulted above)
-- UPDATE products SET main_category = 'homme' WHERE main_category IS NULL;
