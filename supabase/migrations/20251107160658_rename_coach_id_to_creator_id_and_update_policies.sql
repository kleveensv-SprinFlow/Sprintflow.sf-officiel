/*
  # Rename coach_id to creator_id and update RLS policies

  1. Changes
    - Rename `coach_id` column to `creator_id` for more flexibility
    - Allow any authenticated user (coach or athlete) to create custom exercises
    - Update RLS policies to be more flexible and bidirectional
  
  2. Security
    - Any authenticated user can create exercises
    - Users can only manage exercises they created
    - Users can view exercises created by their coaches or athletes (bidirectional)
  
  3. Important Notes
    - Both coaches and athletes can now create custom exercises
    - Coaches can see exercises created by their athletes
    - Athletes can see exercises created by their coaches
    - This creates a collaborative exercise library within each coach-athlete relationship
*/

-- 1. Rename the 'coach_id' column to 'creator_id' to be more generic
ALTER TABLE public.exercices_personnalises
RENAME COLUMN coach_id TO creator_id;

-- 2. Drop all old policies to replace them
DROP POLICY IF EXISTS "Coaches can create custom exercises" ON public.exercices_personnalises;
DROP POLICY IF EXISTS "Coaches can manage their own exercises" ON public.exercices_personnalises;
DROP POLICY IF EXISTS "Athletes can view their coach's custom exercises" ON public.exercices_personnalises;
DROP POLICY IF EXISTS "Athletes can manage their own exercises" ON public.exercices_personnalises;
DROP FUNCTION IF EXISTS is_coach(); -- This function is now too restrictive

-- 3. Create new, more flexible RLS policies

-- POLICY: Any authenticated user can create an exercise
CREATE POLICY "Authenticated users can create exercises"
ON public.exercices_personnalises
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- POLICY: Users can manage the exercises they created
CREATE POLICY "Users can manage their own exercises"
ON public.exercices_personnalises
FOR ALL
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- POLICY: Users can see exercises created by their coaches or their athletes
CREATE POLICY "Users can view exercises from linked users"
ON public.exercices_personnalises
FOR SELECT
TO authenticated
USING (
  -- The user is the creator
  creator_id = auth.uid() OR
  -- The user is a coach, and the creator is one of their athletes (via groups)
  creator_id IN (
    SELECT gm.athlete_id 
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE g.coach_id = auth.uid()
  ) OR
  -- The user is an athlete, and the creator is one of their coaches
  creator_id IN (
    SELECT g.coach_id 
    FROM group_members gm
    JOIN groups g ON g.id = gm.group_id
    WHERE gm.athlete_id = auth.uid()
  )
);