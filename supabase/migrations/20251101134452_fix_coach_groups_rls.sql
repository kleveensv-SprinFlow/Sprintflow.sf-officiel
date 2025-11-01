/*
  # Fix Coach Groups RLS Policies

  This migration fixes Row Level Security policies to allow coaches to properly access their groups and group members.

  ## Changes Made
  1. Updated policy for coaches to read their own groups
  2. Updated policy for coaches to read members of their groups

  ## Security
  - Coaches can only see groups they own (where they are the coach_id)
  - Coaches can only see members of groups they own
  - Uses authenticated users only
*/

-- Policy for coaches to see their own groups
DROP POLICY IF EXISTS "Allow coach to read their own groups" ON public.groups;
CREATE POLICY "Allow coach to read their own groups"
ON public.groups
FOR SELECT
TO authenticated
USING (auth.uid() = coach_id);

-- Policy for coaches to see members of their groups
DROP POLICY IF EXISTS "Allow coach to read members of their groups" ON public.group_members;
CREATE POLICY "Allow coach to read members of their groups"
ON public.group_members
FOR SELECT
TO authenticated
USING (
  exists (
    select 1 from groups g
    where g.id = group_members.group_id
    and g.coach_id = auth.uid()
  )
);
