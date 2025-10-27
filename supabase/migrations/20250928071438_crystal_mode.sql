/*
  # Ajouter les colonnes de contenu à la table workouts

  1. Nouvelles colonnes
    - `runs` (jsonb) - Données des courses
    - `jumps` (jsonb) - Données des sauts  
    - `throws` (jsonb) - Données des lancers
    - `exercises` (jsonb) - Données des exercices

  2. Valeurs par défaut
    - Toutes les colonnes ont une valeur par défaut '[]'::jsonb (tableau vide)
    - Les colonnes sont nullables pour la compatibilité

  3. Sécurité
    - Les politiques RLS existantes s'appliquent automatiquement
*/

-- Ajouter les colonnes de contenu d'entraînement
ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS runs jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS jumps jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS throws jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS exercises jsonb DEFAULT '[]'::jsonb;

-- Créer des index pour optimiser les requêtes sur le contenu JSON
CREATE INDEX IF NOT EXISTS idx_workouts_runs ON workouts USING gin (runs);
CREATE INDEX IF NOT EXISTS idx_workouts_jumps ON workouts USING gin (jumps);
CREATE INDEX IF NOT EXISTS idx_workouts_throws ON workouts USING gin (throws);
CREATE INDEX IF NOT EXISTS idx_workouts_exercises ON workouts USING gin (exercises);