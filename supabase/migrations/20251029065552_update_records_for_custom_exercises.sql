/*
  # Update records table for custom exercises

  1. Changes
    - Add `exercice_personnalise_id` column to link to custom exercises
    - Rename `exercice_id` to `exercice_reference_id` for clarity
    - Add constraint to ensure record links to only one exercise type
    - Add index for performance
  
  2. Notes
    - Keeps existing `exercise_name` for backward compatibility
    - Records can link to either reference or custom exercises, not both
*/

-- Add column for custom exercises
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'records' AND column_name = 'exercice_personnalise_id'
  ) THEN
    ALTER TABLE records 
    ADD COLUMN exercice_personnalise_id UUID REFERENCES exercices_personnalises(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Rename exercice_id to exercice_reference_id for clarity
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'records' AND column_name = 'exercice_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'records' AND column_name = 'exercice_reference_id'
  ) THEN
    ALTER TABLE records 
    RENAME COLUMN exercice_id TO exercice_reference_id;
  END IF;
END $$;

-- Add index for custom exercise lookups
CREATE INDEX IF NOT EXISTS idx_records_exercice_personnalise_id 
ON records(exercice_personnalise_id);

-- Add constraint to ensure record is linked to one exercise type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_records_single_exercise_type'
  ) THEN
    ALTER TABLE records
    ADD CONSTRAINT chk_records_single_exercise_type CHECK (
      (exercice_reference_id IS NOT NULL AND exercice_personnalise_id IS NULL) OR
      (exercice_reference_id IS NULL AND exercice_personnalise_id IS NOT NULL) OR
      (exercice_reference_id IS NULL AND exercice_personnalise_id IS NULL AND exercise_name IS NOT NULL)
    );
  END IF;
END $$;