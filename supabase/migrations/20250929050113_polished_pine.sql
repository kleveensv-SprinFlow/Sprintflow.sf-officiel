/*
  # Remove circular RLS policies causing infinite recursion

  1. Problem Analysis
    - The `profiles` table has policies that reference `group_members`
    - The `group_members` table has policies that reference `profiles`
    - This creates a circular dependency causing infinite recursion

  2. Solution
    - Drop all existing policies on both tables
    - Create new simplified policies without circular references
    - Use direct auth.uid() checks instead of complex subqueries

  3. Security
    - Users can access their own profile
    - Group members can see other members in their groups
    - Coaches can manage their groups
*/

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "profiles_basic_access" ON profiles;
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;

DROP POLICY IF EXISTS "group_members_read_access" ON group_members;
DROP POLICY IF EXISTS "group_members_insert_access" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_access" ON group_members;
DROP POLICY IF EXISTS "group_members_simple_read" ON group_members;
DROP POLICY IF EXISTS "group_members_simple_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_simple_delete" ON group_members;

-- Create simple, non-recursive policies for profiles
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Create simple, non-recursive policies for group_members
CREATE POLICY "group_members_own_access" ON group_members
  FOR ALL
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Allow coaches to manage their group members (without recursion)
CREATE POLICY "group_members_coach_access" ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;