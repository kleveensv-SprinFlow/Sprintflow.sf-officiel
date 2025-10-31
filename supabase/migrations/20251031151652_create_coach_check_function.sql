/******************************************************************
** Function: is_coach_of_athlete
** Description: Checks if the currently authenticated user is the coach of a given athlete.
**              This function is defined with SECURITY DEFINER to securely query the relationships
**              between coaches and athletes without exposing the underlying tables directly in RLS policies.
**
** Parameters:
**   p_athlete_id UUID - The ID of the athlete to check.
**
** Returns:
**   BOOLEAN - True if the current user is the coach of the athlete, false otherwise.
******************************************************************/
CREATE OR REPLACE FUNCTION is_coach_of_athlete(p_athlete_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Check if the current user's ID appears as a coach in any group
  -- that the specified athlete is a member of.
  RETURN EXISTS (
    SELECT 1
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE g.coach_id = auth.uid() AND gm.athlete_id = p_athlete_id
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_coach_of_athlete(UUID) TO authenticated;
