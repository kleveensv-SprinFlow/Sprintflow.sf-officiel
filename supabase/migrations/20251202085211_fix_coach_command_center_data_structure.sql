/*
  # Fix get_coach_command_center_data to Match Expected Types

  1. Problem
    - Current function returns simplified structure
    - Frontend expects: presence{planned, checked_in, total_athletes}, health{injured, fatigued}, load{planned, realized, unit}, next_up[], actions{pending_wellness, pending_review}

  2. Solution
    - Update function to return correct structure matching CommandCenterData type
    - Add next_up as empty array for now
    - Update field names to match exactly
*/

DROP FUNCTION IF EXISTS get_coach_command_center_data();

CREATE OR REPLACE FUNCTION get_coach_command_center_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p_coach_id uuid;
  athlete_ids uuid[];
  
  presence_data jsonb;
  health_data jsonb;
  load_data jsonb;
  next_up_data jsonb;
  actions_data jsonb;
  
  v_week_start date;
  v_week_end date;
  v_today date;
BEGIN
  p_coach_id := auth.uid();
  v_today := current_date;
  v_week_start := date_trunc('week', v_today)::date;
  v_week_end := (v_week_start + interval '6 days')::date;

  -- Get Coach's Athletes
  SELECT ARRAY_AGG(DISTINCT gm.athlete_id)
  INTO athlete_ids
  FROM groups g
  JOIN group_members gm ON g.id = gm.group_id
  WHERE g.coach_id = p_coach_id;

  -- Handle empty team
  IF athlete_ids IS NULL OR array_length(athlete_ids, 1) = 0 THEN
     RETURN jsonb_build_object(
      'presence', jsonb_build_object('planned', 0, 'checked_in', 0, 'total_athletes', 0),
      'health', jsonb_build_object('injured', 0, 'fatigued', 0),
      'load', jsonb_build_object('planned', 0, 'realized', 0, 'unit', 'UA'),
      'next_up', '[]'::jsonb,
      'actions', jsonb_build_object('pending_wellness', 0, 'pending_review', 0)
    );
  END IF;

  -- PRESENCE
  WITH today_workouts AS (
    SELECT count(distinct user_id) as cnt 
    FROM workouts 
    WHERE date = v_today AND user_id = ANY(athlete_ids)
  ),
  today_checkins AS (
    SELECT count(distinct user_id) as cnt
    FROM wellness_log
    WHERE date = v_today AND user_id = ANY(athlete_ids)
  )
  SELECT jsonb_build_object(
    'planned', (SELECT cnt FROM today_workouts),
    'checked_in', (SELECT cnt FROM today_checkins),
    'total_athletes', array_length(athlete_ids, 1)
  ) INTO presence_data;

  -- HEALTH
  WITH active_injuries AS (
    SELECT count(distinct user_id) as cnt
    FROM injury_logs
    WHERE user_id = ANY(athlete_ids) AND status = 'active'
  ),
  critical_wellness AS (
    SELECT count(distinct user_id) as cnt
    FROM wellness_log
    WHERE user_id = ANY(athlete_ids) 
    AND date = v_today
    AND (
      (COALESCE(ressenti_sommeil, 3) + 
       (6 - COALESCE(stress_level, 3)) + 
       (6 - COALESCE(muscle_fatigue, 3)) +
       COALESCE(energie_subjective, 3) +
       COALESCE(humeur_subjective, 3)) / 5.0
    ) < 2.5
  )
  SELECT jsonb_build_object(
    'injured', (SELECT cnt FROM active_injuries),
    'fatigued', (SELECT cnt FROM critical_wellness)
  ) INTO health_data;

  -- LOAD
  WITH weekly_stats AS (
    SELECT 
      SUM(COALESCE(duration_minutes, 60) * COALESCE(planned_rpe, 5)) as planned_load,
      SUM(CASE WHEN validated_at IS NOT NULL THEN COALESCE(duration_minutes, 60) * COALESCE(echelle_effort, 0) ELSE 0 END) as realized_load
    FROM workouts
    WHERE user_id = ANY(athlete_ids)
    AND date >= v_week_start AND date <= v_week_end
  )
  SELECT jsonb_build_object(
    'planned', COALESCE((SELECT planned_load FROM weekly_stats), 0),
    'realized', COALESCE((SELECT realized_load FROM weekly_stats), 0),
    'unit', 'UA'
  ) INTO load_data;

  -- NEXT UP (simplified for now - returns empty array)
  next_up_data := '[]'::jsonb;

  -- ACTIONS
  WITH pending_reviews AS (
    SELECT count(*) as cnt
    FROM workouts
    WHERE user_id = ANY(athlete_ids)
    AND validated_at IS NOT NULL
    AND is_reviewed IS FALSE
  )
  SELECT jsonb_build_object(
    'pending_wellness', (array_length(athlete_ids, 1) - (presence_data->>'checked_in')::int),
    'pending_review', (SELECT cnt FROM pending_reviews)
  ) INTO actions_data;

  -- BUILD FINAL RESULT
  RETURN jsonb_build_object(
    'presence', presence_data,
    'health', health_data,
    'load', load_data,
    'next_up', next_up_data,
    'actions', actions_data
  );
END;
$$;
