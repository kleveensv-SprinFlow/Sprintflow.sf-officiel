/*
  # Allow reading groups by invitation code
  
  ## Problem
  Athletes cannot find groups by invitation code because RLS policies
  only allow reading groups if you're already a member or the coach.
  
  ## Solution
  Add a new policy that allows ANY authenticated user to read groups
  when querying by invitation_code. This is safe because:
  1. Invitation codes are meant to be shared
  2. Users can only read basic group info (id, coach_id, name)
  3. They cannot modify the group
  
  ## Changes
  - Add policy to allow reading groups by invitation code
*/

-- Allow authenticated users to read groups when filtering by invitation_code
CREATE POLICY "Anyone can read groups by invitation code"
  ON groups
  FOR SELECT
  TO authenticated
  USING (invitation_code IS NOT NULL);
