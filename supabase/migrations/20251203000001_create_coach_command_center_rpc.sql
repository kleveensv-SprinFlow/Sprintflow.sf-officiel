-- Function to get Coach Command Center Data
-- Returns: Presence, Health, Load, Next Up, Actions

CREATE OR REPLACE FUNCTION get_coach_command_center_data()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  p_coach_id UUID;
  athlete_ids UUID[];
  
  -- Result variables
  presence_data JSONB;
  health_data JSONB;
  load_data JSONB;
  next_up_data JSONB;
  actions_data JSONB;
  
  -- Date variables
  v_week_start DATE;
  v_week_end DATE;
  v_today DATE;
BEGIN
  p_coach_id := auth.uid();
  v_today := current_date;
  v_week_start := date_trunc('week', v_today)::date;
  v_week_end := (v_week_start + interval '6 days')::date;

  -- 1. Get Coach's Athletes
  SELECT ARRAY_AGG(DISTINCT gm.athlete_id)
  INTO athlete_ids
  FROM public.group_members gm
  JOIN public.groups g ON gm.group_id = g.id
  WHERE g.coach_id = p_coach_id;

  -- Handle empty team
  IF athlete_ids IS NULL OR array_length(athlete_ids, 1) = 0 THEN
     RETURN jsonb_build_object(
      'presence', jsonb_build_object('planned', 0, 'checked_in', 0, 'total_active', 0),
      'health', jsonb_build_object('injured', 0, 'fatigued', 0, 'all_good', 0),
      'load', jsonb_build_object('planned', 0, 'realized', 0, 'unit', 'UA'),
      'next_up', '[]'::jsonb,
      'actions', jsonb_build_object('pending_wellness', 0, 'pending_review', 0)
    );
  END IF;

  -- 2. PRESENCE (Operationality)
  -- Active = Athletes with a workout PLANNED today
  -- Checked In = Athletes with wellness log today
  WITH today_workouts AS (
    SELECT count(distinct user_id) as cnt 
    FROM public.workouts 
    WHERE date = v_today AND user_id = ANY(athlete_ids)
  ),
  today_checkins AS (
    SELECT count(distinct user_id) as cnt
    FROM public.wellness_log
    WHERE date = v_today AND user_id = ANY(athlete_ids)
  )
  SELECT jsonb_build_object(
    'planned', (SELECT cnt FROM today_workouts),
    'checked_in', (SELECT cnt FROM today_checkins),
    'total_athletes', array_length(athlete_ids, 1)
  ) INTO presence_data;

  -- 3. HEALTH (Check Engine Light)
  -- Active Injuries: status = 'active'
  -- Critical Wellness: average score < 2.5 (on 5 scale) today
  WITH active_injuries AS (
    SELECT count(distinct user_id) as cnt
    FROM public.injury_logs
    WHERE user_id = ANY(athlete_ids) AND status = 'active'
  ),
  critical_wellness AS (
    SELECT count(distinct user_id) as cnt
    FROM public.wellness_log
    WHERE user_id = ANY(athlete_ids) 
    AND date = v_today
    AND (
      (COALESCE(ressenti_sommeil, 0) + COALESCE(stress_level, 0) + COALESCE(muscle_fatigue, 0)) / 
      NULLIF((CASE WHEN ressenti_sommeil IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN stress_level IS NOT NULL THEN 1 ELSE 0 END) + (CASE WHEN muscle_fatigue IS NOT NULL THEN 1 ELSE 0 END), 0)
    ) < 2.5
  )
  SELECT jsonb_build_object(
    'injured', (SELECT cnt FROM active_injuries),
    'fatigued', (SELECT cnt FROM critical_wellness)
  ) INTO health_data;

  -- 4. LOAD (Pilotage)
  -- Weekly Load: Planned vs Realized
  -- Planned = duration * planned_rpe
  -- Realized = duration * echelle_effort (for validated workouts)
  WITH weekly_stats AS (
    SELECT 
      SUM(COALESCE(duration_minutes, 60) * COALESCE(planned_rpe, 5)) as planned_load,
      SUM(CASE WHEN validated_at IS NOT NULL THEN COALESCE(duration_minutes, 60) * COALESCE(echelle_effort, 0) ELSE 0 END) as realized_load
    FROM public.workouts
    WHERE user_id = ANY(athlete_ids)
    AND date >= v_week_start AND date <= v_week_end
  )
  SELECT jsonb_build_object(
    'planned', COALESCE((SELECT planned_load FROM weekly_stats), 0),
    'realized', COALESCE((SELECT realized_load FROM weekly_stats), 0),
    'unit', 'UA'
  ) INTO load_data;

  -- 5. NEXT UP (Immediacy)
  -- Get top 3 upcoming sessions for today
  -- If no time specified, it's just "Today"
  -- Group by "Group" or "Athlete"? Usually workouts are individual but linked to groups conceptually.
  -- Ideally, we show "Group Sprint - 16:30". But workouts table is per user.
  -- We can approximate by looking for workouts with same title/time.
  -- For now, let's return a simplified list of distinct workout titles/times scheduled for today.
  SELECT jsonb_agg(t) INTO next_up_data
  FROM (
    SELECT DISTINCT ON (w.title)
      w.title,
      -- We don't have a specific 'time' column in workouts, relying on title or planned_data if it exists. 
      -- Assuming 'title' or 'notes' might contain time, but for now we just return the title.
      -- The user prompt mentioned "Si horaire précis". 
      -- If we lack a time column, we can't sort by time. 
      -- Let's return the count of athletes doing this workout.
      count(*) as athlete_count
    FROM public.workouts w
    WHERE w.user_id = ANY(athlete_ids) AND w.date = v_today
    GROUP BY w.title
    LIMIT 3
  ) t;

  -- 6. ACTIONS (Gamification)
  -- Pending Wellness: Athletes who haven't logged wellness today (Total - CheckedIn)
  -- Pending Review: Workouts with validated_at NOT NULL AND is_reviewed IS FALSE
  WITH pending_reviews AS (
    SELECT count(*) as cnt
    FROM public.workouts
    WHERE user_id = ANY(athlete_ids)
    AND validated_at IS NOT NULL
    AND is_reviewed IS FALSE
  ),
  pending_wellness_count AS (
     SELECT (array_length(athlete_ids, 1) - (SELECT cnt FROM today_checkins)) as cnt
  )
  SELECT jsonb_build_object(
    'pending_wellness', (SELECT cnt FROM pending_wellness_count),
    'pending_review', (SELECT cnt FROM pending_reviews)
  ) INTO actions_data;

  -- BUILD FINAL RESULT
  RETURN jsonb_build_object(
    'presence', presence_data,
    'health', health_data,
    'load', load_data,
    'next_up', COALESCE(next_up_data, '[]'::jsonb),
    'actions', actions_data
  );
END;
$$;
