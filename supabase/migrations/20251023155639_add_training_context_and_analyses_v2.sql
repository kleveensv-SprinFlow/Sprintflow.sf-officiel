/*
  # Module 2: Mise à Niveau du Module Entraînements

  1. Modifications de la table workouts
    - Ajout de `tag_seance` (intention de la séance: vitesse, endurance, technique)
    - Ajout de `courses_json` (liste des courses avec temps et type de chrono)

  2. Nouvelle table workout_analyses
    - `id` (uuid, primary key)
    - `workout_id` (uuid, foreign key vers workouts)
    - `athlete_id` (uuid, foreign key vers profiles)
    - `performance_du_jour_pct` (pourcentage de performance vs record)
    - `fatigue_drop_off_pct` (pourcentage de chute entre premier et dernier chrono)
    - `evaluation_contexte` (évaluation en fonction du tag de séance)
    - `created_at` (timestamp)

  3. Sécurité
    - Enable RLS sur workout_analyses
    - Politiques pour que les athlètes voient leurs analyses
    - Politiques pour que les membres du groupe voient les analyses
*/

-- Ajouter les colonnes à workouts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'tag_seance'
  ) THEN
    ALTER TABLE workouts ADD COLUMN tag_seance text CHECK (tag_seance IN ('vitesse_max', 'endurance_lactique', 'technique_recup'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'courses_json'
  ) THEN
    ALTER TABLE workouts ADD COLUMN courses_json jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Créer la table workout_analyses
CREATE TABLE IF NOT EXISTS workout_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  athlete_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  performance_du_jour_pct numeric(5,2),
  fatigue_drop_off_pct numeric(5,2),
  evaluation_contexte text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workout_analyses ENABLE ROW LEVEL SECURITY;

-- Politique pour les athlètes (voir leurs propres analyses)
CREATE POLICY "Athletes can view own analyses"
  ON workout_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

-- Politique pour insérer leurs propres analyses
CREATE POLICY "Athletes can insert own analyses"
  ON workout_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

-- Politique pour les coachs (via les groupes)
CREATE POLICY "Group coaches can view member analyses"
  ON workout_analyses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      INNER JOIN group_members gm ON gm.group_id = g.id
      WHERE g.coach_id = auth.uid()
      AND gm.athlete_id = workout_analyses.athlete_id
    )
  );

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_workout_analyses_athlete 
  ON workout_analyses(athlete_id);
CREATE INDEX IF NOT EXISTS idx_workout_analyses_workout 
  ON workout_analyses(workout_id);