/*
  # Création des tables workouts et records

  ## Tables créées
  
  1. `workouts` - Entraînements des athlètes
  2. `records` - Records personnels des athlètes
  
  ## Fonctions
  
  - `update_updated_at_column()` - Trigger pour mettre à jour automatiquement updated_at
*/

-- Créer la fonction update_updated_at si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
DROP POLICY IF EXISTS "workouts_full_access" ON workouts;

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
CREATE INDEX IF NOT EXISTS idx_workouts_courses_json ON workouts USING GIN (courses_json);
CREATE INDEX IF NOT EXISTS idx_workouts_muscu_json ON workouts USING GIN (muscu_json);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS workouts_updated_at_trigger ON workouts;
CREATE TRIGGER workouts_updated_at_trigger
  BEFORE UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Créer la table records si elle n'existe pas
CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_name text,
  exercice_id UUID REFERENCES exercices_reference(id),
  weight_kg decimal(6,2),
  reps integer,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Policies pour records
DROP POLICY IF EXISTS "records_policy" ON records;
DROP POLICY IF EXISTS "Users can manage own records" ON records;
DROP POLICY IF EXISTS "records_full_access" ON records;

CREATE POLICY "records_full_access"
  ON records
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes pour records
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_exercice_id ON records(exercice_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON records(date DESC);

-- Trigger for updated_at on records
DROP TRIGGER IF EXISTS records_updated_at_trigger ON records;
CREATE TRIGGER records_updated_at_trigger
  BEFORE UPDATE ON records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();