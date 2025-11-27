-- Fonction pour obtenir les stats des groupes du coach
-- Correction : Ajout des alias (g.max_members) pour éviter l'erreur d'ambiguïté

CREATE OR REPLACE FUNCTION get_coach_groups_analytics(coach_uuid uuid)
RETURNS TABLE (
  group_id uuid,
  group_name text,
  member_count bigint,
  avg_score numeric,
  checkin_count bigint,
  alerts_count bigint,
  pending_requests_count bigint,
  max_members integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- 1. Récupération des groupes (Alias 'g' ajouté ici pour corriger le bug)
  coach_groups AS (
    SELECT g.id, g.name, g.max_members
    FROM groups g
    WHERE g.coach_id = coach_uuid
  ),
  -- 2. Membres des groupes
  group_memberships AS (
    SELECT 
      gm.group_id,
      gm.athlete_id
    FROM group_members gm
    JOIN coach_groups cg ON gm.group_id = cg.id
  ),
  -- 3. Logs du jour
  today_logs AS (
    SELECT 
      wl.user_id,
      wl.ressenti_sommeil,
      wl.stress_level,
      wl.muscle_fatigue,
      wl.energie_subjective,
      wl.humeur_subjective
    FROM wellness_log wl
    WHERE wl.date = CURRENT_DATE
    AND wl.user_id IN (SELECT athlete_id FROM group_memberships)
  ),
  -- 4. Calcul des scores
  member_scores AS (
    SELECT 
      tl.user_id,
      (
        COALESCE(tl.ressenti_sommeil, 50) + 
        COALESCE(tl.energie_subjective, 50) + 
        COALESCE(tl.humeur_subjective, 50) + 
        (100 - COALESCE(tl.stress_level, 50)) + 
        (100 - COALESCE(tl.muscle_fatigue, 50))
      ) / 5.0 as calculated_score,
      CASE WHEN (
        COALESCE(tl.stress_level, 0) > 75 OR 
        COALESCE(tl.muscle_fatigue, 0) > 75 OR 
        COALESCE(tl.ressenti_sommeil, 100) < 30 OR 
        COALESCE(tl.humeur_subjective, 100) < 30
      ) THEN 1 ELSE 0 END as has_alert
    FROM today_logs tl
  ),
  -- 5. Agrégation par groupe
  group_stats AS (
    SELECT 
      gm.group_id,
      COUNT(gm.athlete_id) as total_members,
      COUNT(ms.user_id) as checkins_today,
      COALESCE(AVG(ms.calculated_score), 0) as average_score,
      COALESCE(SUM(ms.has_alert), 0) as total_alerts
    FROM group_memberships gm
    LEFT JOIN member_scores ms ON gm.athlete_id = ms.user_id
    GROUP BY gm.group_id
  ),
  -- 6. Requêtes en attente
  pending_requests AS (
    SELECT 
      gjr.group_id,
      COUNT(*) as pending_count
    FROM group_join_requests gjr
    WHERE gjr.status = 'pending'
    AND gjr.group_id IN (SELECT id FROM coach_groups)
    GROUP BY gjr.group_id
  )
  
  SELECT 
    cg.id as group_id,
    cg.name as group_name,
    COALESCE(gs.total_members, 0) as member_count,
    COALESCE(gs.average_score, 0) as avg_score,
    COALESCE(gs.checkins_today, 0) as checkin_count,
    COALESCE(gs.total_alerts, 0) as alerts_count,
    COALESCE(pr.pending_count, 0) as pending_requests_count,
    cg.max_members
  FROM coach_groups cg
  LEFT JOIN group_stats gs ON cg.id = gs.group_id
  LEFT JOIN pending_requests pr ON cg.id = pr.group_id;
END;
$$;