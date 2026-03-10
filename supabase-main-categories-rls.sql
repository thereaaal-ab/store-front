-- Allow store-front (anon) to read main_categories so dynamic categories show in nav.
-- Run in Supabase SQL Editor after the backoffice has run: npm run db:push
-- (which creates the main_categories table).

-- Enable RLS on main_categories (optional; if not already enabled)
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read so the store-front can display Homme / Femme / Enfant (and any custom ones)
CREATE POLICY "main_categories_select"
ON main_categories FOR SELECT
TO anon, authenticated
USING (true);
