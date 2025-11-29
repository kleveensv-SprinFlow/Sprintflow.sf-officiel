/*
  # Fix Infinite Recursion and Analytics Function (Corrected)

  This migration fixes critical issues:

  1. **Infinite Recursion in RLS Policies**
     - Removes circular dependencies in group_members and groups policies
     - Simplifies policy checks to prevent infinite loops

  2. **Analytics Function Fixes**
     - Uses correct column names: date (not date_log or date_blessure)
     - Fixes injury_logs reference to use user_id
     - Removes non-existent is_active column from injury_logs

  3. **Performance Optimizations**
     - Adds indexes for frequently queried columns
*/

-- =====================================================
-- STEP 1: Fix infinite recursion in RLS policies
-- =====================================================

DROP POLICY IF EXISTS "enable_select_access" ON group_members;
DROP POLICY IF EXISTS "enable_insert_access" ON group_members;
DROP POLICY IF EXISTS "enable_delete_access" ON group_members;

CREATE POLICY "enable_select_access" ON group_members FOR SELECT TO authenticated
USING (
    athlete_id = (select auth.uid())
);

CREATE POLICY "enable_insert_access" ON group_members FOR INSERT TO authenticated
WITH CHECK (
    athlete_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON group_members FOR DELETE TO authenticated
USING (
    athlete_id = (select auth.uid())
);

DROP POLICY IF EXISTS "enable_select_access" ON groups;
DROP POLICY IF EXISTS "enable_insert_access" ON groups;
DROP POLICY IF EXISTS "enable_update_access" ON groups;
DROP POLICY IF EXISTS "enable_delete_access" ON groups;

CREATE POLICY "enable_select_access" ON groups FOR SELECT TO authenticated
USING (
    coach_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = groups.id
        AND gm.athlete_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON groups FOR INSERT TO authenticated
WITH CHECK (
    coach_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON groups FOR UPDATE TO authenticated
USING (
    coach_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON groups FOR DELETE TO authenticated
USING (
    coach_id = (select auth.uid())
);

-- =====================================================
-- STEP 2: Fix and recreate analytics function
-- =====================================================

DROP FUNCTION IF EXISTS get_coach_groups_analytics(uuid);
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

        COALESCE(
            ROUND(
                AVG(w.score_forme)::numeric,
                1
            ),
            0
        ) AS avg_score,

        COUNT(DISTINCT w.id)::bigint AS checkin_count,

        (
            COUNT(DISTINCT CASE WHEN w.score_forme < 5 THEN w.id END) +
            COUNT(DISTINCT i.id)
        )::bigint AS alerts_count,

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

-- =====================================================
-- STEP 3: Add performance indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_group_members_athlete_id ON group_members(athlete_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_coach_id ON groups(coach_id);
CREATE INDEX IF NOT EXISTS idx_wellness_log_date_user ON wellness_log(date, user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_log_user_id ON wellness_log(user_id);
CREATE INDEX IF NOT EXISTS idx_injury_logs_date_user ON injury_logs(date, user_id);
CREATE INDEX IF NOT EXISTS idx_group_join_requests_status ON group_join_requests(group_id, status);
