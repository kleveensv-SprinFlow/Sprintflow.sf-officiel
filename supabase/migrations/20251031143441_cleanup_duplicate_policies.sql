/*
  # Clean up duplicate policies on group_members
  
  ## Problem
  Multiple duplicate policies exist on group_members table from previous migrations
  
  ## Solution
  Remove all old duplicate policies, keep only the clean set
*/

-- Remove old duplicate policies
DROP POLICY IF EXISTS "Coaches can delete their group members" ON group_members;
DROP POLICY IF EXISTS "Coaches can read their groups members" ON group_members;
DROP POLICY IF EXISTS "Coaches can update their group members" ON group_members;
DROP POLICY IF EXISTS "Members can read their group memberships" ON group_members;
