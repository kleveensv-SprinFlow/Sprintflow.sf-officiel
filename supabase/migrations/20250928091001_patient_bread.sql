/*
  # Création de la table partnerships avec politiques RLS corrigées

  1. Nouvelles Tables
    - `partnerships`
      - `id` (uuid, primary key)
      - `name` (text, nom du partenaire)
      - `description` (text, description du partenariat)
      - `photo_url` (text, URL de la photo)
      - `promo_code` (text, code promotionnel)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `partnerships`
    - Politique SELECT publique pour tous les utilisateurs authentifiés
    - Politique de gestion pour l'utilisateur développeur spécifique

  3. Données de démonstration
    - 3 partenariats avec images Pexels
*/

-- Supprimer la table si elle existe déjà
DROP TABLE IF EXISTS partnerships;

-- Créer la table partnerships
CREATE TABLE partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  photo_url text,
  promo_code text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT timezone('utc'::text, now())
);

-- Activer RLS
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;

-- Politique SELECT : Lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to view partnerships"
  ON partnerships
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique INSERT/UPDATE/DELETE : Gestion pour le développeur uniquement
CREATE POLICY "Allow developer to manage partnerships"
  ON partnerships
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_partnerships()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER partnerships_updated_at_trigger
  BEFORE UPDATE ON partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_partnerships();

-- Insérer des données de démonstration
INSERT INTO partnerships (name, description, photo_url, promo_code) VALUES
(
  'Nike Performance',
  'Équipements sportifs de haute performance pour athlètes professionnels. Chaussures, vêtements et accessoires techniques.',
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800',
  'ATHLETE20'
),
(
  'Protein World',
  'Compléments alimentaires et nutrition sportive premium. Protéines, vitamines et suppléments pour optimiser vos performances.',
  'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=800',
  'NUTRITION15'
),
(
  'TechnoGym',
  'Équipements de fitness et technologies d''entraînement innovantes. Machines cardio, musculation et solutions connectées.',
  'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
  'TECHNO10'
);