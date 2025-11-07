/*
  # Update exercices_personnalises table to support coaches

  1. Changes
    - Add `coach_id` column to allow coaches to create custom exercises
    - Keep `athlete_id` for backward compatibility
    - Update RLS policies to allow both coaches and athletes to manage their exercises
  
  2. Security
    - Add policy for coaches to create and manage their own custom exercises
    - Add policy for athletes to manage their own custom exercises
    - Add policy for athletes to view exercises created by their coaches
  
  3. Functions
    - `is_coach()` - Helper function to check if current user is a coach
  
  4. Important Notes
    - Coaches can create custom exercises that their athletes can use
    - Athletes can still create their own personal custom exercises
    - Custom exercises are automatically deleted when the creator deletes their account
*/

-- Add coach_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'exercices_personnalises' AND column_name = 'coach_id'
    ) THEN
        ALTER TABLE public.exercices_personnalises ADD COLUMN coach_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Function to check if the current user is a coach
CREATE OR REPLACE FUNCTION is_coach()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid() AND role = 'coach'
    );
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Coaches can create custom exercises" ON public.exercices_personnalises;
DROP POLICY IF EXISTS "Coaches can manage their own exercises" ON public.exercices_personnalises;
DROP POLICY IF EXISTS "Athletes can view their coach's custom exercises" ON public.exercices_personnalises;
DROP POLICY IF EXISTS "Athletes can manage their own exercises" ON public.exercices_personnalises;

-- RLS Policy: Allow coaches to create custom exercises
CREATE POLICY "Coaches can create custom exercises"
ON public.exercices_personnalises
FOR INSERT
TO authenticated
WITH CHECK (is_coach() AND coach_id = auth.uid());

-- RLS Policy: Allow coaches to manage their own custom exercises
CREATE POLICY "Coaches can manage their own exercises"
ON public.exercices_personnalises
FOR ALL
TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

-- RLS Policy: Allow athletes to manage their own custom exercises
CREATE POLICY "Athletes can manage their own exercises"
ON public.exercices_personnalises
FOR ALL
TO authenticated
USING (athlete_id = auth.uid())
WITH CHECK (athlete_id = auth.uid());

-- RLS Policy: Allow athletes to view exercises created by their coach(es)
CREATE POLICY "Athletes can view their coach's custom exercises"
ON public.exercices_personnalises
FOR SELECT
TO authenticated
USING (
    coach_id IN (
        SELECT g.coach_id 
        FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = auth.uid()
    )
);