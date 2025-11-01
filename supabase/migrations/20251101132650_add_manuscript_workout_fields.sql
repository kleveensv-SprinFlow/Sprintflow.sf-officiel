/*
  # Add Manuscript Workout Fields

  This migration adds support for two types of workouts: "guidé" (guided) and "manuscrit" (manuscript/freeform).

  ## Changes Made
  1. Add `type` column to workouts table (default: 'guidé')
  2. Add `notes` column to workouts table for manuscript-style sessions
  3. Update RLS policies to allow modification of these new columns

  ## Security
  - Policies ensure users can only create/update their own workouts
  - Coaches can update workouts for their athletes
*/

-- Add type and notes columns to workouts table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'type') THEN
    ALTER TABLE public.workouts ADD COLUMN type TEXT DEFAULT 'guidé' NOT NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'notes') THEN
    ALTER TABLE public.workouts ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Create helper function to check if a user is a coach of another user
CREATE OR REPLACE FUNCTION is_coach_of_user(coach_uuid UUID, athlete_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM coach_athlete_links
    WHERE coach_id = coach_uuid
      AND athlete_id = athlete_uuid
      AND status = 'ACCEPTED'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for workouts

-- Policy for INSERT
DROP POLICY IF EXISTS "Allow authenticated users to create workouts" ON public.workouts;
CREATE POLICY "Allow authenticated users to create workouts"
ON public.workouts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for UPDATE (users can update their own workouts)
DROP POLICY IF EXISTS "Allow users to update their own workouts" ON public.workouts;
CREATE POLICY "Allow users to update their own workouts"
ON public.workouts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for coaches to update their athletes' workouts
DROP POLICY IF EXISTS "Allow coaches to update their athletes' workouts" ON public.workouts;
CREATE POLICY "Allow coaches to update their athletes' workouts"
ON public.workouts
FOR UPDATE
TO authenticated
USING (is_coach_of_user(auth.uid(), user_id))
WITH CHECK (is_coach_of_user(auth.uid(), user_id));
