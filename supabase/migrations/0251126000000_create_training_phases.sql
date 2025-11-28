-- Create training_phases table
CREATE TABLE IF NOT EXISTS training_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  athlete_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('volume', 'intensite', 'recuperation', 'competition')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  color_hex text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT target_check CHECK (
    (group_id IS NOT NULL AND athlete_id IS NULL) OR 
    (group_id IS NULL AND athlete_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_training_phases_coach_id ON training_phases(coach_id);
CREATE INDEX IF NOT EXISTS idx_training_phases_group_id ON training_phases(group_id);
CREATE INDEX IF NOT EXISTS idx_training_phases_athlete_id ON training_phases(athlete_id);
CREATE INDEX IF NOT EXISTS idx_training_phases_dates ON training_phases(start_date, end_date);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS training_phases_updated_at_trigger ON training_phases;
CREATE TRIGGER training_phases_updated_at_trigger BEFORE UPDATE ON training_phases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE training_phases ENABLE ROW LEVEL SECURITY;

-- Policies

-- Coach policies
DROP POLICY IF EXISTS "Coaches can manage their own phases" ON training_phases;
CREATE POLICY "Coaches can manage their own phases" ON training_phases 
  FOR ALL 
  TO authenticated 
  USING (coach_id = auth.uid()) 
  WITH CHECK (coach_id = auth.uid());

-- Athlete policies (Read only)
DROP POLICY IF EXISTS "Athletes can view their own phases" ON training_phases;
CREATE POLICY "Athletes can view their own phases" ON training_phases 
  FOR SELECT 
  TO authenticated 
  USING (
    athlete_id = auth.uid() OR
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM group_members gm 
      WHERE gm.group_id = training_phases.group_id 
      AND gm.athlete_id = auth.uid()
    ))
  );
