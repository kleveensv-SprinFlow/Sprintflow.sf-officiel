/******************************************************************
** Function: join_group_with_invite_code
** Description: Allows an authenticated athlete to join a group by providing a valid invitation code.
**              This function encapsulates the logic for verifying the code and inserting the member,
**              ensuring the operation is secure and atomic.
**
** Parameters:
**   p_invite_code TEXT - The invitation code for the group to join.
**
** Returns:
**   TABLE(status TEXT, message TEXT) - A status and message indicating success or failure.
******************************************************************/
CREATE OR REPLACE FUNCTION join_group_with_invite_code(p_invite_code TEXT)
RETURNS TABLE(status TEXT, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID;
  v_athlete_id UUID := auth.uid();
  v_is_already_member BOOLEAN;
BEGIN
  -- Validate the invitation code and get the group ID
  SELECT id INTO v_group_id
  FROM groups
  WHERE invitation_code = upper(p_invite_code);

  IF v_group_id IS NULL THEN
    RETURN QUERY SELECT 'error'::TEXT, 'Code d''invitation invalide'::TEXT;
    RETURN;
  END IF;

  -- Check if the athlete is already a member of the group
  SELECT EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = v_group_id AND athlete_id = v_athlete_id
  ) INTO v_is_already_member;

  IF v_is_already_member THEN
    RETURN QUERY SELECT 'error'::TEXT, 'Vous êtes déjà membre de ce groupe'::TEXT;
    RETURN;
  END IF;

  -- Insert the athlete into the group
  BEGIN
    INSERT INTO group_members (group_id, athlete_id)
    VALUES (v_group_id, v_athlete_id);
  EXCEPTION
    WHEN OTHERS THEN
      -- This will catch any RLS violations or other insert errors
      RETURN QUERY SELECT 'error'::TEXT, 'Impossible de rejoindre le groupe en raison d''une erreur de permission.'::TEXT;
      RETURN;
  END;

  RETURN QUERY SELECT 'success'::TEXT, 'Vous avez rejoint le groupe avec succès !'::TEXT;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION join_group_with_invite_code(TEXT) TO authenticated;
