/*
  # Ajouter le type de chaussures aux records

  1. Modifications de table
    - Ajouter la colonne `shoe_type` à la table `records`
    - Valeurs possibles : 'spikes' (pointes) ou 'sneakers' (baskets)
    - Colonne optionnelle pour compatibilité avec les données existantes

  2. Index
    - Ajouter un index sur `shoe_type` pour optimiser les requêtes
    - Index composite sur `user_id`, `exercise_name`, `shoe_type` pour les groupements

  3. Sécurité
    - Aucune modification des politiques RLS nécessaire
    - La colonne hérite des politiques existantes
*/

-- Ajouter la colonne shoe_type à la table records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'records' AND column_name = 'shoe_type'
  ) THEN
    ALTER TABLE records ADD COLUMN shoe_type text;
  END IF;
END $$;

-- Ajouter une contrainte pour valider les valeurs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'records_shoe_type_check'
  ) THEN
    ALTER TABLE records ADD CONSTRAINT records_shoe_type_check 
    CHECK (shoe_type IS NULL OR shoe_type IN ('spikes', 'sneakers'));
  END IF;
END $$;

-- Ajouter un index pour optimiser les requêtes par type de chaussures
CREATE INDEX IF NOT EXISTS idx_records_shoe_type ON records (shoe_type);

-- Ajouter un index composite pour les groupements par discipline et chaussures
CREATE INDEX IF NOT EXISTS idx_records_exercise_shoe_type ON records (user_id, exercise_name, shoe_type);