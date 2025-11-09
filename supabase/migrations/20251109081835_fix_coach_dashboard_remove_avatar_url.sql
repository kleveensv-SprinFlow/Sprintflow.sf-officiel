/*
  # Correction de la fonction get_coach_dashboard_analytics
  
  ## Problème
  - La fonction `get_coach_dashboard_analytics` référence la colonne `avatar_url` qui a été supprimée
  - Cela cause des erreurs 400 en production
  
  ## Solution
  - Remplacer `avatar_url` par `photo_url` dans la fonction
  - S'assurer que toutes les références utilisent les colonnes correctes
  
  ## Changements
  1. Recréer la fonction avec `photo_url` au lieu de `avatar_url`
  2. Maintenir la même logique fonctionnelle
*/

-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS get_coach_dashboard_analytics();

-- Recréer la fonction avec les bonnes colonnes
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
  p_coach_id := auth.uid();

  SELECT ARRAY_AGG(DISTINCT gm.athlete_id)
  INTO athlete_ids
  FROM public.group_members gm
  JOIN public.groups g ON gm.group_id = g.id
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
          COALESCE(wl.sleep_quality, 0) +
          COALESCE(wl.stress_level, 0) +
          COALESCE(wl.fatigue_level, 0)
        ) /
        NULLIF(
          (CASE WHEN wl.sleep_quality IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN wl.stress_level IS NOT NULL THEN 1 ELSE 0 END) +
          (CASE WHEN wl.fatigue_level IS NOT NULL THEN 1 ELSE 0 END),
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
      p.photo_url  -- CORRECTION: Utiliser photo_url au lieu de avatar_url
    FROM public.profiles p
    WHERE p.id = ANY(athlete_ids)
      AND NOT EXISTS (
        SELECT 1
        FROM public.wellness_log wl
        WHERE wl.user_id = p.id
          AND wl.date = current_date
      )
  ),
  pending_validation_data AS (
    SELECT
      w.id as workout_id,
      p.id as athlete_id,
      p.full_name,
      p.photo_url,  -- CORRECTION: Utiliser photo_url au lieu de avatar_url
      w.title as workout_title,
      w.scheduled_date
    FROM public.workouts w
    JOIN public.profiles p ON w.user_id = p.id
    WHERE (w.user_id = ANY(athlete_ids) OR w.assigned_to_user_id = ANY(athlete_ids))
      AND w.status = 'completed'
      AND w.validated_at IS NULL
    ORDER BY w.created_at DESC
  )
  SELECT jsonb_build_object(
    'teamHealth', jsonb_build_object(
      'wellnessTrend', COALESCE((SELECT jsonb_agg(w) FROM wellness_data w), '[]'::jsonb),
      'adherence', COALESCE((SELECT jsonb_build_object(
        'completed', ad.completed_count,
        'planned', ad.planned_count,
        'rate', CASE WHEN ad.planned_count > 0 THEN ad.completed_count::float / ad.planned_count ELSE 0 END
      ) FROM adherence_data ad), jsonb_build_object('completed', 0, 'planned', 0, 'rate', 0))
    ),
    'priorityActions', jsonb_build_object(
      'pendingWellness', COALESCE((SELECT jsonb_agg(pw) FROM pending_wellness_data pw), '[]'::jsonb),
      'pendingValidation', COALESCE((SELECT jsonb_agg(pv) FROM pending_validation_data pv), '[]'::jsonb)
    )
  )
  INTO result;

  RETURN result;
END;
$$;