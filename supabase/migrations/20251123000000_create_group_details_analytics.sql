-- Function to get recent records for a specific group, including athlete details
CREATE OR REPLACE FUNCTION get_group_recent_records(
  p_group_id UUID,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  athlete_first_name TEXT,
  athlete_last_name TEXT,
  athlete_photo_url TEXT,
  exercise_name TEXT,
  value NUMERIC,
  unit TEXT,
  date DATE,
  type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    p.first_name,
    p.last_name,
    p.photo_url,
    r.exercise_name,
    r.value,
    r.unit,
    r.date,
    r.type
  FROM records r
  JOIN profiles p ON r.user_id = p.id
  JOIN group_members gm ON p.id = gm.athlete_id
  WHERE gm.group_id = p_group_id
  ORDER BY r.date DESC
  LIMIT p_limit;
END;
$$;

-- Function to get the average wellness score for a group for today
CREATE OR REPLACE FUNCTION get_group_daily_wellness_score(p_group_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  avg_score NUMERIC;
BEGIN
  SELECT 
      COALESCE(AVG(
        (
          COALESCE(wl.ressenti_sommeil, 50) + 
          COALESCE(wl.energie_subjective, 50) + 
          COALESCE(wl.humeur_subjective, 50) + 
          (100 - COALESCE(wl.stress_level, 50)) + 
          (100 - COALESCE(wl.muscle_fatigue, 50))
        ) / 5.0
      ), 0)
  INTO avg_score
  FROM wellness_log wl
  JOIN group_members gm ON wl.user_id = gm.athlete_id
  WHERE gm.group_id = p_group_id
  AND wl.date = CURRENT_DATE;
  
  RETURN avg_score;
END;
$$;
