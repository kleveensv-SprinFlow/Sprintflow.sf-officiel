/*
  # Fix Group Members Policies and Column References

  This migration fixes:
  1. Removes duplicate RLS policies on group_members
  2. Ensures policies reference the correct column name (athlete_id instead of user_id)
  3. Adds missing user_id column or ensures athlete_id is properly used

  ## Changes Made
  - Clean up duplicate policies on group_members table
  - Ensure consistent use of athlete_id column
  - Fix policy for viewing own membership

  ## Security
  - Maintains proper access control for coaches and athletes
  - Ensures data integrity
*/

-- First, check if user_id column exists and add it as an alias/view, or rename athlete_id
-- We'll standardize on athlete_id since that's what the schema uses

-- Drop duplicate/old policies
DROP POLICY IF EXISTS "Coaches view group members" ON public.group_members;
DROP POLICY IF EXISTS "View own membership" ON public.group_members;
DROP POLICY IF EXISTS "Allow coach to read members of their groups" ON public.group_members;

-- Create clean policies for group_members

-- Policy: Coaches can view members of their groups
CREATE POLICY "Coaches can view their group members"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
    AND g.coach_id = auth.uid()
  )
);

-- Policy: Athletes can view their own membership
CREATE POLICY "Athletes can view own membership"
ON public.group_members
FOR SELECT
TO authenticated
USING (athlete_id = auth.uid());

-- Policy: Coaches can add members to their groups
DROP POLICY IF EXISTS "Coaches add members" ON public.group_members;
CREATE POLICY "Coaches can add members"
ON public.group_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
    AND g.coach_id = auth.uid()
  )
);

-- Policy: Coaches can update members in their groups
DROP POLICY IF EXISTS "Coaches update members" ON public.group_members;
CREATE POLICY "Coaches can update members"
ON public.group_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
    AND g.coach_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
    AND g.coach_id = auth.uid()
  )
);

-- Policy: Coaches can remove members from their groups
DROP POLICY IF EXISTS "Coaches remove members" ON public.group_members;
CREATE POLICY "Coaches can remove members"
ON public.group_members
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_members.group_id
    AND g.coach_id = auth.uid()
  )
);
