# Storefront (SaaS 2)

Application cliente publique pour un mini e-commerce (ventes WhatsApp/Instagram). Se connecte à la **même base Supabase** que le back-office (SaaS 1).

## Stack

- Next.js 15+ (App Router), TypeScript, Tailwind, shadcn-style UI
- Supabase (anon key côté client, service_role uniquement en Server Action)
- Zustand (panier + persist localStorage)

## Variables d'environnement

Créer `.env.local` à la racine de `storefront/` :

```env
# Supabase – clé publique (exposée au client)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase – SERVEUR UNIQUEMENT (Server Action createOrder)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` au client.

**Important :** Le storefront et le back-office doivent utiliser **le même projet Supabase**.  
- Back-office : `DATABASE_URL` = chaîne Postgres du projet (ex. `postgresql://postgres.[ref]:...@...supabase.com:5432/postgres`).  
- Storefront : `NEXT_PUBLIC_SUPABASE_URL` = `https://[ref].supabase.co` (même `[ref]` que dans `DATABASE_URL`).  
Sinon, l’erreur « violates foreign key constraint order_items_product_id_products_id_fk » apparaît au checkout : les produits sont dans un projet et les commandes sont créées dans l’autre.

## Base de données (même que le back-office)

Le storefront s’appuie sur :

- **product_categories** – id, slug, name  
- **products** – id, name, category, image_url, default_price, **is_published**, created_at  
- **product_variants** – id, product_id, size, quantity  
- **orders** – id, first_name, total_amount, payment_status, created_at  
- **order_items** – id, order_id, product_id, variant_id, quantity, price_at_time  

Si le back-office utilise Drizzle et que le schéma partagé a été mis à jour (`is_published`, tables `orders` / `order_items`), exécuter depuis la racine du **back-office** :

```bash
npm run db:push
```

Sinon, exécuter le SQL suivant dans le **Supabase Dashboard** (SQL Editor) :

```sql
-- Colonne storefront sur products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

-- Tables commandes storefront
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  payment_status text NOT NULL DEFAULT 'unpaid',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL,
  price_at_time numeric(10,2) NOT NULL
);

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
```

## RLS (Row Level Security)

Activer RLS sur les tables concernées et créer les policies suivantes dans **Supabase Dashboard** → Authentication → Policies (ou SQL Editor).

### products

- RLS : activé  
- **SELECT** : `USING (is_published = true)` pour `anon` et `authenticated`  
- INSERT/UPDATE/DELETE : réservés au back-office (authenticated ou service_role)

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select_published"
ON products FOR SELECT
TO anon, authenticated
USING (is_published = true);
```

### product_categories

- RLS : activé  
- **SELECT** : `USING (true)` pour `anon`, `authenticated`

```sql
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_categories_select"
ON product_categories FOR SELECT
TO anon, authenticated
USING (true);
```

### product_variants

- RLS : activé  
- **SELECT** : `USING (true)` pour `anon`, `authenticated` (pour afficher tailles/stock)

```sql
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_variants_select"
ON product_variants FOR SELECT
TO anon, authenticated
USING (true);
```

### orders

- RLS : activé  
- **INSERT** : `WITH CHECK (true)` pour `anon` (création commande depuis le storefront)  
- **SELECT / UPDATE** : `USING (true)` pour `authenticated` uniquement (back-office)

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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
```

### order_items

- RLS : activé  
- **INSERT** : `WITH CHECK (true)` pour `anon`  
- **SELECT** : refusé pour `anon` (réservé back-office)

```sql
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items_insert_anon"
ON order_items FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "order_items_select_authenticated"
ON order_items FOR SELECT
TO authenticated
USING (true);
```

Le storefront utilise la **service_role key** dans la Server Action `createOrder`, donc il contourne RLS pour insérer dans `orders` / `order_items` et mettre à jour le stock dans `product_variants`. Ne pas exposer la service_role au client.

## Lancer le projet

```bash
cd storefront
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Déploiement sur Vercel

1. **Importer le projet** : Vercel → New Project → importer le dépôt. Le fichier `vercel.json` à la racine du monorepo définit `rootDirectory: "storefront"` et `framework: "nextjs"`, donc Vercel buildera automatiquement le storefront.

2. **Variables d'environnement** : Dans Vercel → Project → Settings → Environment Variables, ajouter (pour Production, Preview, Development selon besoin) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`  
   Référence : `storefront/.env.example`.

3. **Build** : Aucune config supplémentaire ; avec `rootDirectory: "storefront"`, Vercel exécute `npm install` et `npm run build` dans `storefront/`.

4. **Optionnel** : Si le dépôt racine n’est pas la racine du projet Vercel, définir dans Vercel le **Root Directory** sur `storefront` (redondant si `vercel.json` est à la racine avec `rootDirectory`).

## Dépannage : les produits n’apparaissent pas (Railway / Vercel)

1. **Vérifier `is_published`**  
   Le storefront n’affiche que les produits avec `is_published = true`. Dans le back-office, publier les produits (case à cocher ou champ équivalent). Dans Supabase (Table Editor → `products`), vérifier que la colonne `is_published` est à `true` pour les produits à afficher.

2. **Variables d’environnement sur Railway**  
   Le storefront a besoin de **3 variables** (même projet Supabase que le back-office) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`  
   Les préfixes et noms doivent être **exacts**. Après avoir ajouté ou modifié des variables, **redéployer** le service storefront (les `NEXT_PUBLIC_*` sont figées au moment du build).

3. **Endpoint de diagnostic**  
   Après déploiement, ouvrir :  
   `https://<votre-storefront>.up.railway.app/api/debug-storefront`  
   La réponse indique si les variables sont chargées et les comptes `products.total` / `products.published`. Si `published` est 0 alors que des produits sont publiés en base, revoir `is_published`. Si `env.hasSupabaseUrl` ou `env.hasServiceRoleKey` est `false`, revoir les variables et redéployer.

## Tester le flow

1. **Back-office** : créer des catégories et des produits, cocher **is_published** pour certains produits (si le back-office expose ce champ ; sinon mettre `is_published = true` en SQL sur un produit de test).  
2. **Storefront** : Accueil → liste des catégories ayant au moins un produit publié.  
3. Cliquer sur une catégorie → grid de produits (image, nom, prix, tailles/stock).  
4. Ajouter au panier (par taille si variantes).  
5. Panier → modifier quantités → « Passer commande ».  
6. Checkout → saisir un prénom → « Valider la commande ».  
7. Redirection vers la page succès « Commande #XXX reçue ! On vous contacte via WhatsApp ».  
8. Vérifier dans Supabase : une ligne dans `orders`, les lignes correspondantes dans `order_items`, et le stock décrémenté dans `product_variants`.

## Intégration back-office

- **Même DB** : un seul projet Supabase pour le back-office et le storefront.  
- **is_published** : à gérer dans le back-office (champ ou migration) pour rendre un produit visible ou non sur le storefront.  
- **Stock** : les commandes passées depuis le storefront décrémentent `product_variants.quantity` ; le back-office voit le même stock.
