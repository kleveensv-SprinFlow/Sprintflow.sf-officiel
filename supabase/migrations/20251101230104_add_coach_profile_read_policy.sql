/*
  # Allow coach to read their athletes' profiles

  1. Security
    - Add RLS policy to allow coaches to read profiles of athletes in their groups
    - This enables coaches to see athlete information when managing groups

  2. Changes
    - Drop existing policy if it exists
    - Create new policy for coaches to read athlete profiles based on group membership
*/

-- Allow coach to read their own athletes's profiles
DROP POLICY IF EXISTS "Allow coach to read their own athletes's profiles" ON public.profiles;

CREATE POLICY "Allow coach to read their own athletes's profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT gm.athlete_id
    FROM public.group_members gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE g.coach_id = auth.uid()
  )
);