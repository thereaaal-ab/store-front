-- Product images: up to 6 images per product (ordered by position)
-- Run this in Supabase → SQL Editor (same project as back-office/storefront)

CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  position integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- Optional: backfill from existing products.image_url so current products keep their image
INSERT INTO product_images (product_id, image_url, position)
SELECT id, image_url, 0
FROM products
WHERE image_url IS NOT NULL AND image_url <> '';
