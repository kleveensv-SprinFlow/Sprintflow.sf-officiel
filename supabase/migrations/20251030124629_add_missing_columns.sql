/*
  # Ajout colonnes manquantes

  1. Modifications
    - Ajout `group_photo_url` à la table `groups`
    - Ajout `favorite_disciplines` à la table `profiles`
    - Ajout `full_name` à la table `profiles`

  2. Sécurité
    - Pas de changement RLS (colonnes optionnelles)
*/

-- Ajouter group_photo_url à groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'group_photo_url'
  ) THEN
    ALTER TABLE groups ADD COLUMN group_photo_url text;
  END IF;
END $$;

-- Ajouter favorite_disciplines à profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'favorite_disciplines'
  ) THEN
    ALTER TABLE profiles ADD COLUMN favorite_disciplines text[];
  END IF;
END $$;

-- Ajouter full_name à profiles (computed column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name text GENERATED ALWAYS AS (
      CASE 
        WHEN first_name IS NOT NULL AND last_name IS NOT NULL 
        THEN first_name || ' ' || last_name
        WHEN first_name IS NOT NULL 
        THEN first_name
        WHEN last_name IS NOT NULL 
        THEN last_name
        ELSE ''
      END
    ) STORED;
  END IF;
END $$;