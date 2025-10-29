/*
  # Create custom exercises table

  1. New Tables
    - `exercices_personnalises`
      - `id` (uuid, primary key)
      - `athlete_id` (uuid, foreign key to auth.users)
      - `nom` (text, exercise name)
      - `categorie` (text, category)
      - `groupe_exercice` (text, exercise group)
      - `exercice_reference_id` (uuid, optional reference to base exercise)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `exercices_personnalises` table
    - Add policies for authenticated users to manage their own custom exercises
*/

-- Create the table for custom exercises
CREATE TABLE IF NOT EXISTS exercices_personnalises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nom TEXT NOT NULL,
    categorie TEXT NOT NULL,
    groupe_exercice TEXT,
    exercice_reference_id UUID REFERENCES exercices_reference(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercices_personnalises_athlete_id ON exercices_personnalises(athlete_id);
CREATE INDEX IF NOT EXISTS idx_exercices_personnalises_reference ON exercices_personnalises(exercice_reference_id);

-- Enable RLS
ALTER TABLE exercices_personnalises ENABLE ROW LEVEL SECURITY;

-- Policies for custom exercises
CREATE POLICY "Users can view own custom exercises"
  ON exercices_personnalises FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Users can create own custom exercises"
  ON exercices_personnalises FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Users can update own custom exercises"
  ON exercices_personnalises FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Users can delete own custom exercises"
  ON exercices_personnalises FOR DELETE
  TO authenticated
  USING (auth.uid() = athlete_id);