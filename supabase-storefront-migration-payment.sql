-- Migration : paiement (complet/partiel) + coordonnées client
-- À exécuter si la table orders existe déjà sans ces colonnes

ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_amount numeric(10,2) NOT NULL DEFAULT 0;
