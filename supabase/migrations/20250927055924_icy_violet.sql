/*
  # Correction du schéma profiles

  1. Modifications
    - Assurer que dietary_preferences est bien un tableau text[]
    - Recréer le bucket profile-photos s'il n'existe pas
    - Corriger les politiques de storage

  2. Sécurité
    - Maintenir les politiques RLS existantes
*/

-- Assurer que la colonne dietary_preferences existe et est du bon type
DO $$
BEGIN
  -- Vérifier si la colonne existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'dietary_preferences'
  ) THEN
    -- Ajouter la colonne si elle n'existe pas
    ALTER TABLE profiles ADD COLUMN dietary_preferences text[] DEFAULT '{}';
  ELSE
    -- S'assurer que le type est correct
    ALTER TABLE profiles ALTER COLUMN dietary_preferences TYPE text[] USING 
      CASE 
        WHEN dietary_preferences IS NULL THEN '{}'::text[]
        WHEN dietary_preferences::text = '' THEN '{}'::text[]
        ELSE ARRAY[dietary_preferences::text]
      END;
  END IF;
END $$;

-- Ajouter les autres colonnes manquantes si nécessaire
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'sport'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sport text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'position'
  ) THEN
    ALTER TABLE profiles ADD COLUMN position text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'team'
  ) THEN
    ALTER TABLE profiles ADD COLUMN team text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'photo_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN photo_url text;
  END IF;
END $$;

-- Recréer le bucket profile-photos s'il n'existe pas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques de storage si elles existent
DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Profile photos are publicly readable" ON storage.objects;

-- Recréer les politiques de storage
CREATE POLICY "Users can upload their own profile photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own profile photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own profile photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Profile photos are publicly readable"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-photos');