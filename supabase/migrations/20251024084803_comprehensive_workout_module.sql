/*
  # Module Entraînements Complet pour Sprinteurs

  1. Modifications de la table workouts
    - `date` (date de la séance)
    - `tag_seance` (type/intention: vitesse_max, endurance_lactique, technique_recup)
    - `courses_json` (liste des courses: distance, temps, type_chrono, repos, chaussures)
    - `muscu_json` (liste des exercices: exercice_id, series, reps, poids)
    - `autres_activites` (notes pour sauts, lancers, etc.)
    - `echelle_effort` (1-10, effort ressenti)
    - `notes` (notes libres de l'athlète)
    - `meteo` (conditions météo)
    - `temperature` (température en °C)
    - `title` (titre de la séance)
    - `duration_minutes` (durée de la séance)
    - `user_id` (ID de l'athlète)

  2. Sécurité
    - Maintain existing RLS policies
    - Users can only access their own workouts

  3. Performance
    - Add indexes for quick queries
    - Optimize JSONB queries
*/

-- Assurer que la table workouts existe avec toutes les colonnes nécessaires
DO $$
BEGIN
  -- Vérifier et ajouter les colonnes manquantes

  -- Date de la séance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'date'
  ) THEN
    ALTER TABLE workouts ADD COLUMN date date DEFAULT CURRENT_DATE;
  END IF;

  -- Tag de séance (obligatoire)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'tag_seance'
  ) THEN
    ALTER TABLE workouts ADD COLUMN tag_seance text CHECK (tag_seance IN ('vitesse_max', 'endurance_lactique', 'technique_recup'));
  END IF;

  -- Courses en JSON
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'courses_json'
  ) THEN
    ALTER TABLE workouts ADD COLUMN courses_json jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Musculation en JSON
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'muscu_json'
  ) THEN
    ALTER TABLE workouts ADD COLUMN muscu_json jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Autres activités (optionnel)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'autres_activites'
  ) THEN
    ALTER TABLE workouts ADD COLUMN autres_activites text;
  END IF;

  -- Échelle d'effort (1-10)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'echelle_effort'
  ) THEN
    ALTER TABLE workouts ADD COLUMN echelle_effort integer CHECK (echelle_effort BETWEEN 1 AND 10);
  END IF;

  -- Notes libres
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'notes'
  ) THEN
    ALTER TABLE workouts ADD COLUMN notes text;
  END IF;

  -- Météo
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'meteo'
  ) THEN
    ALTER TABLE workouts ADD COLUMN meteo text;
  END IF;

  -- Température
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'temperature'
  ) THEN
    ALTER TABLE workouts ADD COLUMN temperature numeric(4,1);
  END IF;

  -- Titre de la séance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'title'
  ) THEN
    ALTER TABLE workouts ADD COLUMN title text;
  END IF;

  -- Durée de la séance
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'duration_minutes'
  ) THEN
    ALTER TABLE workouts ADD COLUMN duration_minutes integer DEFAULT 60;
  END IF;

  -- User ID
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE workouts ADD COLUMN user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;

  -- Created at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE workouts ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  -- Updated at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE workouts ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;

END $$;

-- Créer la table workouts si elle n'existe pas
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  title text,
  tag_seance text CHECK (tag_seance IN ('vitesse_max', 'endurance_lactique', 'technique_recup')),
  courses_json jsonb DEFAULT '[]'::jsonb,
  muscu_json jsonb DEFAULT '[]'::jsonb,
  autres_activites text,
  echelle_effort integer CHECK (echelle_effort BETWEEN 1 AND 10),
  notes text,
  meteo text,
  temperature numeric(4,1),
  duration_minutes integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS si pas déjà fait
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "workouts_policy" ON workouts;
DROP POLICY IF EXISTS "Users can manage own workouts" ON workouts;

-- Create simple policy for workouts
CREATE POLICY "workouts_full_access"
  ON workouts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_tag_seance ON workouts(tag_seance);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date DESC);

-- Create GIN index for JSONB columns for fast queries
CREATE INDEX IF NOT EXISTS idx_workouts_courses_json ON workouts USING GIN (courses_json);
CREATE INDEX IF NOT EXISTS idx_workouts_muscu_json ON workouts USING GIN (muscu_json);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS workouts_updated_at_trigger ON workouts;
CREATE TRIGGER workouts_updated_at_trigger
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Documentation des structures JSON

COMMENT ON COLUMN workouts.courses_json IS
'Array of runs: [
  {
    "distance": "100m",
    "temps": 10.72,
    "type_chrono": "manuel" | "electronique",
    "repos": "8 min",
    "chaussures": "pointes" | "baskets"
  }
]';

COMMENT ON COLUMN workouts.muscu_json IS
'Array of strength exercises: [
  {
    "exercice_id": "uuid-from-exercices-table",
    "exercice_nom": "Squat",
    "series": 5,
    "reps": 5,
    "poids": 120
  }
]';

COMMENT ON COLUMN workouts.tag_seance IS
'Type/intention of the workout:
- vitesse_max: Max speed / Explosivity
- endurance_lactique: Lactic endurance
- technique_recup: Technique / Recovery';

COMMENT ON COLUMN workouts.echelle_effort IS
'Perceived effort scale from 1 (easy) to 10 (maximal)';

-- Example data comment
COMMENT ON TABLE workouts IS
'Complete workout tracking for sprinters.
Example workout:
{
  "date": "2024-10-24",
  "tag_seance": "vitesse_max",
  "courses_json": [
    {"distance": "60m", "temps": 6.85, "type_chrono": "electronique", "repos": "8 min", "chaussures": "pointes"},
    {"distance": "60m", "temps": 6.90, "type_chrono": "electronique", "repos": "8 min", "chaussures": "pointes"}
  ],
  "muscu_json": [
    {"exercice_id": "...", "exercice_nom": "Squat", "series": 5, "reps": 5, "poids": 120}
  ],
  "echelle_effort": 8,
  "notes": "Super séance, records personnels!",
  "meteo": "Soleil",
  "temperature": 20.0
}';
