/*
  # Allow coaches to read athlete profiles

  1. Changes
    - Add RLS policy to allow coaches to read profiles of athletes in their groups
    - This enables the coach to see athlete details when viewing group members

  2. Security
    - Coaches can only read profiles of athletes who are members of groups they created
    - The policy uses a subquery to verify the relationship through group_members table
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Coaches can read athlete profiles in their groups" ON profiles;

-- Create policy for coaches to read athlete profiles in their groups
CREATE POLICY "Coaches can read athlete profiles in their groups"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Allow if the profile belongs to an athlete in one of the coach's groups
    id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      INNER JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );
