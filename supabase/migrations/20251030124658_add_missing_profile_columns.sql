/*
  # Ajout colonnes manquantes profiles

  1. Modifications
    - Ajout `date_de_naissance` (date de naissance)
    - Ajout `taille_cm` (taille en cm)
    - Ajout `avatar_url` (alias de photo_url)
    - Ajout `sport` (type de sport)

  2. Notes
    - `avatar_url` est une vue générée pointant vers `photo_url`
*/

-- Ajouter date_de_naissance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'date_de_naissance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_de_naissance date;
  END IF;
END $$;

-- Ajouter taille_cm (hauteur en cm)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'taille_cm'
  ) THEN
    ALTER TABLE profiles ADD COLUMN taille_cm numeric(5,2);
  END IF;
END $$;

-- Ajouter sport
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sport'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sport text;
  END IF;
END $$;

-- Ajouter avatar_url comme alias de photo_url (computed column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text GENERATED ALWAYS AS (photo_url) STORED;
  END IF;
END $$;