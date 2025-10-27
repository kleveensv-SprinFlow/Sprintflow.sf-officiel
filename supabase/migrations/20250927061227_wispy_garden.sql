/*
  # Fix Groups RLS Policies - Remove Infinite Recursion

  1. Security Changes
    - Drop existing problematic policies on groups table
    - Create simple, non-recursive policies for groups
    - Ensure coaches can manage their own groups without recursion
    - Ensure athletes can read groups they belong to without recursion

  2. Policy Structure
    - Simple coach ownership check for groups
    - Direct membership check for athletes without complex joins
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Coaches can manage their groups" ON groups;
DROP POLICY IF EXISTS "Athletes can read groups they belong to" ON groups;

-- Create simple, non-recursive policies for groups
CREATE POLICY "Coaches can manage own groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Athletes can read their groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE athlete_id = auth.uid()
    )
  );

-- Ensure group_members policies are also simple
DROP POLICY IF EXISTS "Coaches can manage their group members" ON group_members;
DROP POLICY IF EXISTS "Athletes can read their group memberships" ON group_members;

CREATE POLICY "Coaches can manage group members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can read own memberships"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "Athletes can insert own memberships"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "Athletes can delete own memberships"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (athlete_id = auth.uid());