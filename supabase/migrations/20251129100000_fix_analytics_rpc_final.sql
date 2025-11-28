-- Supprimer l'ancienne fonction pour éviter les conflits de signature
DROP FUNCTION IF EXISTS get_coach_groups_analytics(uuid);
DROP FUNCTION IF EXISTS get_coach_groups_analytics(uuid, date);

-- Recréation de la fonction avec gestion du Timezone et Alias stricts
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
    group_limit int, -- Renommé pour éviter l'ambiguïté 'max_members'
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
        
        -- Score moyen (Wellness) pour la date donnée
        COALESCE(
            ROUND(
                AVG(w.score_forme)::numeric, 
                1
            ), 
            0
        ) AS avg_score,
        
        -- Nombre de check-ins pour la date donnée
        COUNT(DISTINCT w.id)::bigint AS checkin_count,
        
        -- Nombre d'alertes (Blessures ou forme < 5)
        (
            COUNT(DISTINCT CASE WHEN w.score_forme < 5 THEN w.id END) +
            COUNT(DISTINCT i.id)
        )::bigint AS alerts_count,
        
        -- Demandes en attente
        (
            SELECT COUNT(*)::bigint
            FROM group_join_requests jr
            WHERE jr.group_id = g.id 
            AND jr.status = 'pending'
        ) AS pending_requests_count,
        
        -- Alias explicite pour éviter l'erreur 42702
        g.max_members AS group_limit,
        g.color
        
    FROM 
        groups g
    LEFT JOIN 
        group_members gm ON g.id = gm.group_id
    LEFT JOIN 
        wellness_logs w ON gm.athlete_id = w.user_id 
        AND w.date_log = query_date -- Utilisation du paramètre de date locale
    LEFT JOIN
        injury_logs i ON gm.athlete_id = i.athlete_id 
        AND i.date_blessure = query_date
        AND i.is_active = true
    WHERE 
        g.coach_id = coach_uuid
    GROUP BY 
        g.id, g.name, g.max_members, g.color
    ORDER BY 
        g.created_at DESC;
END;
$$;
