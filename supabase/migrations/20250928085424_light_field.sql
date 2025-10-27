/*
  # Créer la table partnerships et les notifications globales

  1. Nouvelles Tables
    - `partnerships`
      - `id` (uuid, primary key)
      - `name` (text, nom du partenaire)
      - `description` (text, description détaillée)
      - `photo_url` (text, URL de la photo)
      - `promo_code` (text, code promo)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `partnerships`
    - Politique SELECT pour tous les utilisateurs authentifiés
    - Politique INSERT/UPDATE/DELETE pour l'admin développeur uniquement

  3. Storage
    - Bucket pour les photos de partenaires
*/

-- Créer la table partnerships
CREATE TABLE IF NOT EXISTS partnerships (
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

-- Politique pour permettre à tous les utilisateurs authentifiés de voir les partenariats
CREATE POLICY "Allow authenticated users to view partnerships"
  ON partnerships
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Politique pour permettre seulement au développeur de gérer les partenariats
CREATE POLICY "Allow developer to manage partnerships"
  ON partnerships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'kleveennsv@gmail.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'kleveennsv@gmail.com'
    )
  );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_partnerships()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partnerships_updated_at_trigger
  BEFORE UPDATE ON partnerships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_partnerships();

-- Insérer quelques partenariats de démonstration
INSERT INTO partnerships (name, description, photo_url, promo_code) VALUES
(
  'Nike Running',
  'Équipez-vous avec les dernières innovations Nike pour la course. Chaussures de running haute performance, vêtements techniques et accessoires pour optimiser vos performances sur piste et route.',
  'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=400',
  'SPRINT20'
),
(
  'Protein World',
  'Nutrition sportive premium pour athlètes de haut niveau. Protéines whey, créatine, BCAA et compléments alimentaires scientifiquement formulés pour maximiser vos gains et accélérer la récupération.',
  'https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=400',
  'MUSCLE15'
),
(
  'TechnoGym',
  'Équipements de fitness professionnels pour l''entraînement à domicile. Machines cardio, appareils de musculation et solutions connectées pour un entraînement optimal.',
  'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400',
  'GYM25'
);