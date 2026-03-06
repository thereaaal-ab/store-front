-- ============================================================
-- STOREFRONT (SaaS 2) – À exécuter dans Supabase → SQL Editor
-- ============================================================
-- Si vous avez déjà créé orders/order_items en uuid, exécutez d'abord :
--   DROP TABLE IF EXISTS order_items;
--   DROP TABLE IF EXISTS orders;

-- ----- 1. Schéma : colonne + tables -----

-- Colonne visibilité storefront sur products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

-- Table des commandes storefront (id en varchar pour cohérence avec products/clients/etc.)
CREATE TABLE IF NOT EXISTS orders (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  first_name text NOT NULL,
  phone text,
  email text,
  total_amount numeric(10,2) NOT NULL,
  paid_amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'unpaid',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Lignes de commande (prix figé au moment de la commande)
-- product_id / variant_id en varchar pour correspondre à products.id et product_variants.id
CREATE TABLE IF NOT EXISTS order_items (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid()::text,
  order_id varchar NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id varchar NOT NULL REFERENCES products(id),
  variant_id varchar REFERENCES product_variants(id),
  quantity integer NOT NULL,
  price_at_time numeric(10,2) NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);


-- ----- 2. RLS (Row Level Security) -----

-- products : seul le storefront (anon) voit les produits publiés
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "products_select_published" ON products;
CREATE POLICY "products_select_published"
  ON products FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

-- product_categories : lecture pour tous
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_categories_select" ON product_categories;
CREATE POLICY "product_categories_select"
  ON product_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- product_variants : lecture pour afficher tailles / stock
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product_variants_select" ON product_variants;
CREATE POLICY "product_variants_select"
  ON product_variants FOR SELECT
  TO anon, authenticated
  USING (true);

-- orders : anon peut insérer (storefront), authenticated lit/modifie (back-office)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "orders_insert_anon" ON orders;
DROP POLICY IF EXISTS "orders_select_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_update_authenticated" ON orders;
CREATE POLICY "orders_insert_anon"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);
CREATE POLICY "orders_select_authenticated"
  ON orders FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "orders_update_authenticated"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

-- order_items : anon peut insérer, seul authenticated peut lire
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "order_items_insert_anon" ON order_items;
DROP POLICY IF EXISTS "order_items_select_authenticated" ON order_items;
CREATE POLICY "order_items_insert_anon"
  ON order_items FOR INSERT
  TO anon
  WITH CHECK (true);
CREATE POLICY "order_items_select_authenticated"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);
