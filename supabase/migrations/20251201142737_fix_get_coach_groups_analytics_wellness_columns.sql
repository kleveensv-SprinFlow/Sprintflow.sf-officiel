/*
  # Fix get_coach_groups_analytics - Use Correct Wellness Columns

  1. Problem
    - Function references non-existent column `score_forme`
    - wellness_log uses different column names

  2. Solution
    - Calculate wellness score from available columns:
      * ressenti_sommeil (sleep quality)
      * stress_level
      * muscle_fatigue
      * energie_subjective (subjective energy)
      * humeur_subjective (subjective mood)
    - Use average of these metrics for wellness score
    - Handle NULL values appropriately
*/

DROP FUNCTION IF EXISTS get_coach_groups_analytics(uuid, date);

CREATE OR REPLACE FUNCTION get_coach_groups_analytics(
    coach_uuid uuid,
    query_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    group_id uuid,
    group_name text,
    member_count bigint,
    avg_score numeric,
    checkin_count bigint,
    alerts_count bigint,
    pending_requests_count bigint,
    group_limit int,
    color text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id AS group_id,
        g.name AS group_name,
        COUNT(DISTINCT gm.athlete_id)::bigint AS member_count,

        -- Calculate average wellness score from available columns
        COALESCE(
            ROUND(
                AVG(
                    (COALESCE(w.ressenti_sommeil, 3) + 
                     (6 - COALESCE(w.stress_level, 3)) + 
                     (6 - COALESCE(w.muscle_fatigue, 3)) +
                     COALESCE(w.energie_subjective, 3) +
                     COALESCE(w.humeur_subjective, 3)) / 5.0
                )::numeric,
                1
            ),
            0
        ) AS avg_score,

        COUNT(DISTINCT w.id)::bigint AS checkin_count,

        -- Count alerts: low wellness scores + injuries
        (
            COUNT(DISTINCT CASE 
                WHEN (
                    (COALESCE(w.ressenti_sommeil, 3) + 
                     (6 - COALESCE(w.stress_level, 3)) + 
                     (6 - COALESCE(w.muscle_fatigue, 3)) +
                     COALESCE(w.energie_subjective, 3) +
                     COALESCE(w.humeur_subjective, 3)) / 5.0
                ) < 3 
                THEN w.id 
            END) +
            COUNT(DISTINCT i.id)
        )::bigint AS alerts_count,

        -- Count pending join requests
        (
            SELECT COUNT(*)::bigint
            FROM group_join_requests jr
            WHERE jr.group_id = g.id
            AND jr.status = 'pending'
        ) AS pending_requests_count,

        g.max_members AS group_limit,
        g.color

    FROM
        groups g
    LEFT JOIN
        group_members gm ON g.id = gm.group_id
    LEFT JOIN
        wellness_log w ON gm.athlete_id = w.user_id
        AND w.date = query_date
    LEFT JOIN
        injury_logs i ON gm.athlete_id = i.user_id
        AND i.date = query_date
        AND i.pain_level >= 5
    WHERE
        g.coach_id = coach_uuid
    GROUP BY
        g.id, g.name, g.max_members, g.color
    ORDER BY
        g.created_at DESC;
END;
$$;
