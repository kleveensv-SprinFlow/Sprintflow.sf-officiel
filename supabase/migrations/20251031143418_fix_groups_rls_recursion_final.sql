/*
  # Fix infinite recursion in groups RLS policies - FINAL
  
  ## Problem
  The "Athletes can read their groups" policy on the groups table creates
  infinite recursion by querying group_members, which in turn queries groups.
  
  ## Solution
  1. Drop ALL existing SELECT policies on groups
  2. Create a SECURITY DEFINER function to break the recursion chain
  3. Create new non-recursive policies using the function
  
  ## Changes
  - Removes all recursive policies on groups and group_members
  - Creates user_is_group_member() function with SECURITY DEFINER
  - Implements clean, non-recursive policies for both tables
*/

-- Step 1: Drop ALL existing policies on groups
DROP POLICY IF EXISTS "Athletes can read their groups" ON groups;
DROP POLICY IF EXISTS "Coaches can read own groups" ON groups;
DROP POLICY IF EXISTS "Users can read groups they coach" ON groups;
DROP POLICY IF EXISTS "Coaches can insert groups" ON groups;
DROP POLICY IF EXISTS "Coaches can update groups" ON groups;
DROP POLICY IF EXISTS "Coaches can delete groups" ON groups;

-- Step 2: Drop ALL existing policies on group_members
DROP POLICY IF EXISTS "Members can read own membership" ON group_members;
DROP POLICY IF EXISTS "Coaches can read group members" ON group_members;
DROP POLICY IF EXISTS "Coaches can insert group members" ON group_members;
DROP POLICY IF EXISTS "Coaches can update group members" ON group_members;
DROP POLICY IF EXISTS "Coaches can delete group members" ON group_members;
DROP POLICY IF EXISTS "Users can read group members" ON group_members;

-- Step 3: Create SECURITY DEFINER function to check membership (breaks recursion)
CREATE OR REPLACE FUNCTION user_is_group_member(group_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM group_members 
    WHERE group_id = group_id_param 
    AND athlete_id = auth.uid()
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_is_group_member(uuid) TO authenticated;

-- Step 4: Create new NON-RECURSIVE policies for groups

-- Coaches can do everything with their own groups
CREATE POLICY "Coaches manage own groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Athletes can view groups they belong to (using SECURITY DEFINER function)
CREATE POLICY "Athletes view their groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (user_is_group_member(id));

-- Step 5: Create new policies for group_members

-- Anyone can view their own membership
CREATE POLICY "View own membership"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (athlete_id = auth.uid());

-- Coaches can view members of their groups
CREATE POLICY "Coaches view group members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.coach_id = auth.uid()
    )
  );

-- Coaches can add members to their groups
CREATE POLICY "Coaches add members"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.coach_id = auth.uid()
    )
  );

-- Coaches can update members in their groups
CREATE POLICY "Coaches update members"
  ON group_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.coach_id = auth.uid()
    )
  );

-- Coaches can remove members from their groups
CREATE POLICY "Coaches remove members"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.coach_id = auth.uid()
    )
  );
