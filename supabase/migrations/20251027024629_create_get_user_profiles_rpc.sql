CREATE OR REPLACE FUNCTION get_user_profiles_by_ids(user_ids uuid[])
RETURNS TABLE(id uuid, first_name text, last_name text, avatar_url text, role text) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.role
  FROM
    profiles AS p
  WHERE
    p.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;