/*
  # Ajout des colonnes manquantes à la table profiles

  1. Nouvelles colonnes
    - `height` (numeric) - Taille en cm
    - `weight` (numeric) - Poids en kg  
    - `training_frequency` (text) - Fréquence d'entraînement
    - `body_fat_percentage` (numeric) - Pourcentage de masse grasse

  2. Sécurité
    - Aucune modification des politiques RLS existantes
    - Les colonnes sont optionnelles (nullable)
*/

-- Ajouter les colonnes manquantes à la table profiles
DO $$
BEGIN
  -- Ajouter height si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'height'
  ) THEN
    ALTER TABLE profiles ADD COLUMN height numeric;
  END IF;

  -- Ajouter weight si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'weight'
  ) THEN
    ALTER TABLE profiles ADD COLUMN weight numeric;
  END IF;

  -- Ajouter training_frequency si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'training_frequency'
  ) THEN
    ALTER TABLE profiles ADD COLUMN training_frequency text;
  END IF;

  -- Ajouter body_fat_percentage si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'body_fat_percentage'
  ) THEN
    ALTER TABLE profiles ADD COLUMN body_fat_percentage numeric;
  END IF;
END $$;