/*
  # Mise à jour de la table records pour utiliser la référence d'exercices

  ## Modifications
  
  - Ajout d'une colonne `exercice_id` (FK vers exercices_reference)
  - Conservation de `exercise_name` pour compatibilité mais dépréciation
  - Ajout d'index pour performance
  
  ## Migration des données existantes
  
  Les records existants conservent leur `exercise_name` en texte libre.
  Les nouveaux records doivent utiliser `exercice_id`.
  
  ## Notes
  
  Cette migration est non-destructive. Les anciennes données restent accessibles.
*/

-- Ajout de la colonne exercice_id
ALTER TABLE records 
ADD COLUMN IF NOT EXISTS exercice_id UUID REFERENCES exercices_reference(id);

-- Index pour jointure rapide
CREATE INDEX IF NOT EXISTS idx_records_exercice_id ON records(exercice_id);

-- Commentaires
COMMENT ON COLUMN records.exercice_id IS 'Référence vers la table exercices_reference (nouveau système)';
COMMENT ON COLUMN records.exercise_name IS 'Nom libre de l''exercice (ancien système, déprécié)';
