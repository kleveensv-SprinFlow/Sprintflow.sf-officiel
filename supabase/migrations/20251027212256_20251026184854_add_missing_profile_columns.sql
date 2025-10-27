/*
  # Ajout des colonnes manquantes dans la table profiles

  1. Colonnes ajoutées
    - `discipline` (text) - Discipline principale de l'athlète
    - `sexe` (text) - Sexe de l'athlète (homme/femme)
    - `tour_cou_cm` (numeric) - Tour de cou en centimètres
    - `tour_taille_cm` (numeric) - Tour de taille en centimètres  
    - `tour_hanches_cm` (numeric) - Tour de hanches en centimètres (pour femmes)
    - `taille_derniere_modif` (timestamptz) - Date de dernière modification de la taille
    - `measurement_system` (text) - Système de mesure (metric/imperial)

  2. Notes importantes
    - Ces colonnes sont nécessaires pour le suivi des données athlétiques
    - Les tours de mesures sont optionnels mais améliorent la précision des calculs
    - La taille ne peut être modifiée que tous les 30 jours
*/

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$
BEGIN
  -- Ajouter discipline si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'discipline'
  ) THEN
    ALTER TABLE profiles ADD COLUMN discipline text;
  END IF;

  -- Ajouter sexe si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'sexe'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sexe text;
  END IF;

  -- Ajouter tour_cou_cm si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'tour_cou_cm'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tour_cou_cm numeric(5,2);
  END IF;

  -- Ajouter tour_taille_cm si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'tour_taille_cm'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tour_taille_cm numeric(5,2);
  END IF;

  -- Ajouter tour_hanches_cm si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'tour_hanches_cm'
  ) THEN
    ALTER TABLE profiles ADD COLUMN tour_hanches_cm numeric(5,2);
  END IF;

  -- Ajouter taille_derniere_modif si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'taille_derniere_modif'
  ) THEN
    ALTER TABLE profiles ADD COLUMN taille_derniere_modif timestamptz;
  END IF;

  -- Ajouter measurement_system si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'measurement_system'
  ) THEN
    ALTER TABLE profiles ADD COLUMN measurement_system text DEFAULT 'metric' CHECK (measurement_system IN ('metric', 'imperial'));
  END IF;
END $$;