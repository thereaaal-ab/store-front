-- Delete all products (and dependent rows)
-- Run this in Supabase → SQL Editor

-- 1. Remove order line items that reference products
DELETE FROM order_items
WHERE product_id IN (SELECT id FROM products);

-- 2. Remove sale_items that reference product_variants (so we can delete variants)
DELETE FROM sale_items
WHERE product_variant_id IN (SELECT id FROM product_variants);

-- 3. Remove product variants (they reference products)
DELETE FROM product_variants
WHERE product_id IN (SELECT id FROM products);

-- 4. Delete all products
DELETE FROM products;
