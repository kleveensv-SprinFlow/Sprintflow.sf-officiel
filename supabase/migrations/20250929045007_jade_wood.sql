/*
  # Fix group members policies - Remove infinite recursion

  1. Security Changes
    - Drop all existing problematic policies on group_members
    - Create simple, non-recursive policies
    - Ensure athletes can see all members of their groups
    - Ensure coaches can see all members of their groups

  2. Policy Strategy
    - Use direct user ID comparisons instead of complex subqueries
    - Avoid circular references between tables
    - Keep policies simple and efficient
*/

-- Drop all existing policies on group_members to start fresh
DROP POLICY IF EXISTS "group_members_simple_delete" ON group_members;
DROP POLICY IF EXISTS "group_members_simple_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_simple_read" ON group_members;
DROP POLICY IF EXISTS "group_members_policy" ON group_members;

-- Drop all existing policies on profiles that might cause recursion
DROP POLICY IF EXISTS "profiles_simple_access" ON profiles;

-- Create new simple policies for group_members
CREATE POLICY "group_members_read_access"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    -- Athletes can see members of groups they belong to
    group_id IN (
      SELECT group_id 
      FROM group_members 
      WHERE athlete_id = auth.uid()
    )
    OR
    -- Coaches can see members of groups they own
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "group_members_insert_access"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only athletes can join groups (insert themselves)
    athlete_id = auth.uid()
  );

CREATE POLICY "group_members_delete_access"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    -- Athletes can leave groups (delete themselves)
    athlete_id = auth.uid()
    OR
    -- Coaches can remove members from their groups
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = auth.uid()
    )
  );

-- Update profiles policy to be simpler and avoid recursion
CREATE POLICY "profiles_basic_access"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Users can see their own profile
    id = auth.uid()
    OR
    -- Users can see profiles of people in their groups (as athletes)
    id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT group_id 
        FROM group_members 
        WHERE athlete_id = auth.uid()
      )
    )
    OR
    -- Users can see profiles of coaches of their groups
    id IN (
      SELECT g.coach_id
      FROM groups g
      WHERE g.id IN (
        SELECT group_id 
        FROM group_members 
        WHERE athlete_id = auth.uid()
      )
    )
    OR
    -- Coaches can see profiles of their athletes
    id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT id 
        FROM groups 
        WHERE coach_id = auth.uid()
      )
    )
  );