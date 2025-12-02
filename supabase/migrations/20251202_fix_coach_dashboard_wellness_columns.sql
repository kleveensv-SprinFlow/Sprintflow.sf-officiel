-- CORRECTION COMPLÈTE de la fonction get_coach_dashboard_analytics
-- Utilise les bons noms de colonnes : ressenti_sommeil, stress_level, muscle_fatigue

DROP FUNCTION IF EXISTS get_coach_dashboard_analytics();

CREATE OR REPLACE FUNCTION get_coach_dashboard_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  p_coach_id UUID;
  athlete_ids UUID[];
  result JSONB;
BEGIN
  p_coach_id := auth. uid();

  SELECT ARRAY_AGG(DISTINCT gm.athlete_id)
  INTO athlete_ids
  FROM public.group_members gm
  JOIN public.groups g ON gm. group_id = g.id
  WHERE g.coach_id = p_coach_id;

  IF athlete_ids IS NULL OR array_length(athlete_ids, 1) = 0 THEN
    RETURN jsonb_build_object(
      'teamHealth', jsonb_build_object(
        'wellnessTrend', '[]'::jsonb,
        'adherence', jsonb_build_object('completed', 0, 'planned', 0, 'rate', 0)
      ),
      'priorityActions', jsonb_build_object(
        'pendingWellness', '[]'::jsonb,
        'pendingValidation', '[]'::jsonb
      )
    );
  END IF;

  WITH
  wellness_data AS (
    SELECT
      date_trunc('day', wl.date)::date AS day,
      AVG(
        (
          COALESCE(wl.ressenti_sommeil, 0) +
          COALESCE(wl.stress_level, 0) +
          COALESCE(wl.muscle_fatigue, 0)
        ) /
        NULLIF(
          (CASE WHEN wl. ressenti_sommeil IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN wl.stress_level IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN wl.muscle_fatigue IS NOT NULL THEN 1 ELSE 0 END),
          0
        )
      ) as avg_wellness
    FROM public.wellness_log wl
    WHERE wl.user_id = ANY(athlete_ids)
      AND wl.date >= (current_date - interval '7 days')
    GROUP BY day
    HAVING count(*) > 0
    ORDER BY day
  ),
  adherence_data AS (
    SELECT
      COUNT(*) FILTER (WHERE w.status = 'completed') as completed_count,
      COUNT(*) as planned_count
    FROM public.workouts w
    WHERE (w.assigned_to_user_id = ANY(athlete_ids) OR w.user_id = ANY(athlete_ids))
      AND w.scheduled_date >= (current_date - interval '7 days')
      AND w.scheduled_date <= current_date
  ),
  pending_wellness_data AS (
    SELECT
      p.id as athlete_id,
      p.full_name,
      p.photo_url
    FROM public.profiles p
    WHERE p.id = ANY(athlete_ids)
      AND NOT EXISTS (
        SELECT 1
        FROM public.wellness_log wl
        WHERE wl. user_id = p.id
          AND wl.date = current_date
      )
  ),
  pending_validation_data AS (
    SELECT
      w.id as workout_id,
      p.id as athlete_id,
      p.full_name,
      p.photo_url,
      w.title as workout_title,
      w.scheduled_date
    FROM public.workouts w
    JOIN public.profiles p ON w.user_id = p. id
    WHERE (w.user_id = ANY(athlete_ids) OR w.assigned_to_user_id = ANY(athlete_ids))
      AND w.status = 'completed'
      AND w.validated_at IS NULL
    ORDER BY w.created_at DESC
  )
  SELECT jsonb_build_object(
    'teamHealth', jsonb_build_object(
      'wellnessTrend', COALESCE((SELECT jsonb_agg(jsonb_build_object('day', day, 'avg_wellness', avg_wellness)) FROM wellness_data), '[]'::jsonb),
      'adherence', (SELECT jsonb_build_object('completed', completed_count, 'planned', planned_count, 'rate', CASE WHEN planned_count > 0 THEN ROUND((completed_count::numeric / planned_count::numeric) * 100) ELSE 0 END) FROM adherence_data)
    ),
    'priorityActions', jsonb_build_object(
      'pendingWellness', COALESCE((SELECT jsonb_agg(jsonb_build_object('athlete_id', athlete_id, 'full_name', full_name, 'photo_url', photo_url)) FROM pending_wellness_data), '[]'::jsonb),
      'pendingValidation', COALESCE((SELECT jsonb_agg(jsonb_build_object('workout_id', workout_id, 'athlete_id', athlete_id, 'full_name', full_name, 'photo_url', photo_url, 'workout_title', workout_title, 'scheduled_date', scheduled_date)) FROM pending_validation_data), '[]'::jsonb)
    )
  ) INTO result;

  RETURN result;
END;
$$;