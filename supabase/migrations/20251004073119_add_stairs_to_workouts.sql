/*
  # Add Stairs support to Workouts

  ## Description
  This migration adds support for "stairs" exercises in workouts, similar to regular exercises
  but with an optional location field (like hill runs).

  ## Changes
  1. Modifications to `workouts` table
    - Add `stairs` JSONB column to store stairs exercises

  ## Stairs Exercise Structure
  Each stairs exercise will be stored as a JSON object with:
  - id: unique identifier
  - name: name of the stairs exercise
  - sets: number of sets
  - reps: number of repetitions per set
  - weight: optional weight in kg
  - location: optional location of the stairs (e.g., "Stade municipal", "Parc XYZ")
  - rest_time: optional rest time between sets in seconds

  ## Security
  - No changes to RLS policies needed (existing policies cover this column)

  ## Notes
  - Stairs exercises combine the features of regular exercises with location tracking
  - This allows athletes to track stair climbing workouts with precise location data
*/

-- Add stairs column to workouts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'stairs'
  ) THEN
    ALTER TABLE workouts ADD COLUMN stairs JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;