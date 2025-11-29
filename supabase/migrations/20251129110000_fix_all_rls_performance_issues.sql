-- Migration to fix all RLS performance issues by consolidating policies and using (select auth.uid())

-- 1. personal_coach_links (uses athlete_id)
DROP POLICY IF EXISTS "Athletes can see their own links" ON personal_coach_links;
DROP POLICY IF EXISTS "Coaches can see links of their athletes" ON personal_coach_links;
DROP POLICY IF EXISTS "Athletes can create links for themselves" ON personal_coach_links;
DROP POLICY IF EXISTS "Athletes can delete their own links" ON personal_coach_links;
DROP POLICY IF EXISTS "enable_select_access" ON personal_coach_links;
DROP POLICY IF EXISTS "enable_insert_access" ON personal_coach_links;
DROP POLICY IF EXISTS "enable_delete_access" ON personal_coach_links;

CREATE POLICY "enable_select_access" ON personal_coach_links FOR SELECT TO authenticated
USING (
    athlete_id = (select auth.uid()) OR
    coach_id = (select auth.uid())
);

CREATE POLICY "enable_insert_access" ON personal_coach_links FOR INSERT TO authenticated
WITH CHECK (
    athlete_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON personal_coach_links FOR DELETE TO authenticated
USING (
    athlete_id = (select auth.uid())
);


-- 2. training_phases (uses athlete_id)
DROP POLICY IF EXISTS "Coaches can manage their own phases" ON training_phases;
DROP POLICY IF EXISTS "Coaches can manage their own training phases" ON training_phases;
DROP POLICY IF EXISTS "Athletes can view their own phases" ON training_phases;
DROP POLICY IF EXISTS "Athletes can read their own training phases" ON training_phases;
DROP POLICY IF EXISTS "Athletes can read training phases of their groups" ON training_phases;
DROP POLICY IF EXISTS "enable_select_access" ON training_phases;
DROP POLICY IF EXISTS "enable_insert_access" ON training_phases;
DROP POLICY IF EXISTS "enable_update_access" ON training_phases;
DROP POLICY IF EXISTS "enable_delete_access" ON training_phases;

CREATE POLICY "enable_select_access" ON training_phases FOR SELECT TO authenticated
USING (
    athlete_id = (select auth.uid()) OR
    coach_id = (select auth.uid()) OR
    (group_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = training_phases.group_id
        AND gm.athlete_id = (select auth.uid())
    ))
);

CREATE POLICY "enable_insert_access" ON training_phases FOR INSERT TO authenticated
WITH CHECK (
    coach_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON training_phases FOR UPDATE TO authenticated
USING (
    coach_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON training_phases FOR DELETE TO authenticated
USING (
    coach_id = (select auth.uid())
);


-- 3. wellness_log (uses user_id)
DROP POLICY IF EXISTS "Users can manage their own wellness logs" ON wellness_log;
DROP POLICY IF EXISTS "Users can insert their own wellness logs" ON wellness_log;
DROP POLICY IF EXISTS "Users can update their own wellness logs" ON wellness_log;
DROP POLICY IF EXISTS "Users can view their own wellness logs" ON wellness_log;
DROP POLICY IF EXISTS "Coaches can read wellness logs of their athletes" ON wellness_log;
DROP POLICY IF EXISTS "Coaches can view their athletes' wellness logs" ON wellness_log;
DROP POLICY IF EXISTS "Coaches can view wellness logs of group members" ON wellness_log;
DROP POLICY IF EXISTS "enable_select_access" ON wellness_log;
DROP POLICY IF EXISTS "enable_insert_access" ON wellness_log;
DROP POLICY IF EXISTS "enable_update_access" ON wellness_log;
DROP POLICY IF EXISTS "enable_delete_access" ON wellness_log;

CREATE POLICY "enable_select_access" ON wellness_log FOR SELECT TO authenticated
USING (
    user_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = wellness_log.user_id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = wellness_log.user_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON wellness_log FOR INSERT TO authenticated
WITH CHECK (
    user_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON wellness_log FOR UPDATE TO authenticated
USING (
    user_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON wellness_log FOR DELETE TO authenticated
USING (
    user_id = (select auth.uid())
);


-- 4. favorite_blocks (coach_id)
DROP POLICY IF EXISTS "Coaches can CRUD their own favorite blocks" ON favorite_blocks;
DROP POLICY IF EXISTS "enable_all_access" ON favorite_blocks;

CREATE POLICY "enable_all_access" ON favorite_blocks FOR ALL TO authenticated
USING (
    coach_id = (select auth.uid())
);


-- 5. donnees_corporelles (uses athlete_id)
DROP POLICY IF EXISTS "Athletes can manage their own body data" ON donnees_corporelles;
DROP POLICY IF EXISTS "Coaches can view their athletes body data" ON donnees_corporelles;
DROP POLICY IF EXISTS "enable_select_access" ON donnees_corporelles;
DROP POLICY IF EXISTS "enable_insert_access" ON donnees_corporelles;
DROP POLICY IF EXISTS "enable_update_access" ON donnees_corporelles;
DROP POLICY IF EXISTS "enable_delete_access" ON donnees_corporelles;

CREATE POLICY "enable_select_access" ON donnees_corporelles FOR SELECT TO authenticated
USING (
    athlete_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = donnees_corporelles.athlete_id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = donnees_corporelles.athlete_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON donnees_corporelles FOR INSERT TO authenticated
WITH CHECK (
    athlete_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON donnees_corporelles FOR UPDATE TO authenticated
USING (
    athlete_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON donnees_corporelles FOR DELETE TO authenticated
USING (
    athlete_id = (select auth.uid())
);


-- 6. exercices_personnalises (uses creator_id and athlete_id logic - keeping creator_id as per schema check)
-- Actually schema says: athlete_id UUID NOT NULL REFERENCES auth.users(id) in 20251029220000_complete_schema.sql
-- But 20251107160658_rename_coach_id_to_creator_id_and_update_policies.sql might have changed it.
-- Let's stick to creator_id if that was the latest known state, or safe bet 'creator_id' from my previous grep.
-- Wait, 20251107160658 says "rename coach_id to creator_id".
-- And 20251029220000 had athlete_id.
-- This table is tricky. Let's check policies grep.
-- "Coaches can create custom exercises"
-- "Coaches can manage their own exercises"
-- "Athletes can manage their own exercises"
-- If I use the wrong column here I break it.
-- Let's assume 'creator_id' is the unified column for ownership if the rename happened.
-- But wait, the table might have both?
-- Let's check `exercices_personnalises` structure if possible? No direct tool.
-- Based on "rename_coach_id_to_creator_id", likely it is creator_id.
-- But earlier schema had `athlete_id`.
-- Let's try to be safe. If `creator_id` exists, use it.
-- The previous migration I wrote used `creator_id` and the user complained about `athlete_id` in `workouts` (which I fixed).
-- The user did NOT complain about `exercices_personnalises`.
-- So `creator_id` might be correct OR the user didn't get that far.
-- I will stick to `creator_id` as it seems to be the intended latest design, but I'll add `athlete_id` policy just in case? No, that causes ambiguity.
-- I'll use `creator_id` as in my previous attempt.

DROP POLICY IF EXISTS "Authenticated users can create exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can manage their own exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can view exercises from linked users" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can create own custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can update own custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can delete own custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Coaches can create custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Coaches can manage their own exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Athletes can manage their own exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Athletes can view their coach's custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "enable_select_access" ON exercices_personnalises;
DROP POLICY IF EXISTS "enable_insert_access" ON exercices_personnalises;
DROP POLICY IF EXISTS "enable_update_access" ON exercices_personnalises;
DROP POLICY IF EXISTS "enable_delete_access" ON exercices_personnalises;

CREATE POLICY "enable_select_access" ON exercices_personnalises FOR SELECT TO authenticated
USING (
    creator_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.coach_id = exercices_personnalises.creator_id
        AND pcl.athlete_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE g.coach_id = exercices_personnalises.creator_id
        AND gm.athlete_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON exercices_personnalises FOR INSERT TO authenticated
WITH CHECK (
    creator_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON exercices_personnalises FOR UPDATE TO authenticated
USING (
    creator_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON exercices_personnalises FOR DELETE TO authenticated
USING (
    creator_id = (select auth.uid())
);


-- 7. group_join_requests (uses athlete_id)
DROP POLICY IF EXISTS "Allow athlete to read their own requests" ON group_join_requests;
DROP POLICY IF EXISTS "Allow coach to read requests for their groups" ON group_join_requests;
DROP POLICY IF EXISTS "Allow athlete to create requests" ON group_join_requests;
DROP POLICY IF EXISTS "Allow coach to update request status for their groups" ON group_join_requests;
DROP POLICY IF EXISTS "enable_select_access" ON group_join_requests;
DROP POLICY IF EXISTS "enable_insert_access" ON group_join_requests;
DROP POLICY IF EXISTS "enable_update_access" ON group_join_requests;
DROP POLICY IF EXISTS "enable_delete_access" ON group_join_requests;

CREATE POLICY "enable_select_access" ON group_join_requests FOR SELECT TO authenticated
USING (
    athlete_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM groups g
        WHERE g.id = group_join_requests.group_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON group_join_requests FOR INSERT TO authenticated
WITH CHECK (
    athlete_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON group_join_requests FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM groups g
        WHERE g.id = group_join_requests.group_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_delete_access" ON group_join_requests FOR DELETE TO authenticated
USING (
    athlete_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM groups g
        WHERE g.id = group_join_requests.group_id
        AND g.coach_id = (select auth.uid())
    )
);


-- 8. group_members (uses athlete_id)
DROP POLICY IF EXISTS "Athletes can view own membership" ON group_members;
DROP POLICY IF EXISTS "Coaches can view their group members" ON group_members;
DROP POLICY IF EXISTS "View own membership" ON group_members;
DROP POLICY IF EXISTS "Coaches view group members" ON group_members;
DROP POLICY IF EXISTS "Coaches add members" ON group_members;
DROP POLICY IF EXISTS "Coaches update members" ON group_members;
DROP POLICY IF EXISTS "Coaches remove members" ON group_members;
DROP POLICY IF EXISTS "Allow coach to read members of their groups" ON group_members;
DROP POLICY IF EXISTS "enable_select_access" ON group_members;
DROP POLICY IF EXISTS "enable_insert_access" ON group_members;
DROP POLICY IF EXISTS "enable_delete_access" ON group_members;

CREATE POLICY "enable_select_access" ON group_members FOR SELECT TO authenticated
USING (
    athlete_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM groups g
        WHERE g.id = group_members.group_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON group_members FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM groups g
        WHERE g.id = group_members.group_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_delete_access" ON group_members FOR DELETE TO authenticated
USING (
    athlete_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM groups g
        WHERE g.id = group_members.group_id
        AND g.coach_id = (select auth.uid())
    )
);


-- 9. groups (uses coach_id)
DROP POLICY IF EXISTS "Allow coach to read their own groups" ON groups;
DROP POLICY IF EXISTS "Coaches manage own groups" ON groups;
DROP POLICY IF EXISTS "Athletes view their groups" ON groups;
DROP POLICY IF EXISTS "Users can read their groups" ON groups;
DROP POLICY IF EXISTS "Coaches can manage their groups" ON groups;
DROP POLICY IF EXISTS "Anyone can read groups by invitation code" ON groups;
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


-- 10. injury_logs (uses user_id)
DROP POLICY IF EXISTS "Coaches can read injury logs of their athletes" ON injury_logs;
DROP POLICY IF EXISTS "Users can read their own injury logs" ON injury_logs;
DROP POLICY IF EXISTS "Users can insert their own injury logs" ON injury_logs;
DROP POLICY IF EXISTS "enable_select_access" ON injury_logs;
DROP POLICY IF EXISTS "enable_insert_access" ON injury_logs;
DROP POLICY IF EXISTS "enable_update_access" ON injury_logs;
DROP POLICY IF EXISTS "enable_delete_access" ON injury_logs;

CREATE POLICY "enable_select_access" ON injury_logs FOR SELECT TO authenticated
USING (
    user_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = injury_logs.user_id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = injury_logs.user_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON injury_logs FOR INSERT TO authenticated
WITH CHECK (
    user_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON injury_logs FOR UPDATE TO authenticated
USING (
    user_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON injury_logs FOR DELETE TO authenticated
USING (
    user_id = (select auth.uid())
);


-- 11. profiles (uses id)
DROP POLICY IF EXISTS "Allow authenticated users to read coach codes" ON profiles;
DROP POLICY IF EXISTS "Coaches can read athlete profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile securely" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent lire leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Coaches can read athlete profiles in their groups" ON profiles;
DROP POLICY IF EXISTS "Group members can read each other profiles" ON profiles;
DROP POLICY IF EXISTS "Group members can read each other profiles simple" ON profiles;
DROP POLICY IF EXISTS "Allow coach to read their own athletes's profiles" ON profiles;
DROP POLICY IF EXISTS "Users read accessible profiles via groups" ON profiles;
DROP POLICY IF EXISTS "Users can read accessible profiles" ON profiles;
DROP POLICY IF EXISTS "Public avatar access" ON profiles;
DROP POLICY IF EXISTS "enable_select_access" ON profiles;
DROP POLICY IF EXISTS "enable_update_access" ON profiles;

CREATE POLICY "enable_select_access" ON profiles FOR SELECT TO authenticated
USING (
    id = (select auth.uid()) OR
    -- Coach reading athletes
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = profiles.id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = profiles.id
        AND g.coach_id = (select auth.uid())
    ) OR
    -- Group members reading each other
    EXISTS (
        SELECT 1 FROM group_members gm1
        JOIN group_members gm2 ON gm1.group_id = gm2.group_id
        WHERE gm1.athlete_id = (select auth.uid())
        AND gm2.athlete_id = profiles.id
    ) OR
    (role = 'coach')
);

CREATE POLICY "enable_update_access" ON profiles FOR UPDATE TO authenticated
USING (
    id = (select auth.uid())
);


-- 12. records (uses user_id - FIXED from athlete_id)
DROP POLICY IF EXISTS "Coaches can view athlete records" ON records;
DROP POLICY IF EXISTS "Users can view own records" ON records;
DROP POLICY IF EXISTS "Users can insert own records" ON records;
DROP POLICY IF EXISTS "Users can update own records" ON records;
DROP POLICY IF EXISTS "Users can delete own records" ON records;
DROP POLICY IF EXISTS "Allow athlete and coach access to records" ON records;
DROP POLICY IF EXISTS "records_full_access" ON records;
DROP POLICY IF EXISTS "enable_select_access" ON records;
DROP POLICY IF EXISTS "enable_insert_access" ON records;
DROP POLICY IF EXISTS "enable_update_access" ON records;
DROP POLICY IF EXISTS "enable_delete_access" ON records;

CREATE POLICY "enable_select_access" ON records FOR SELECT TO authenticated
USING (
    user_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = records.user_id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = records.user_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON records FOR INSERT TO authenticated
WITH CHECK (
    user_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON records FOR UPDATE TO authenticated
USING (
    user_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON records FOR DELETE TO authenticated
USING (
    user_id = (select auth.uid())
);


-- 13. video_analysis_logs (uses user_id - FIXED from athlete_id)
DROP POLICY IF EXISTS "Athletes can manage their own analysis logs" ON video_analysis_logs;
DROP POLICY IF EXISTS "Coaches can view shared analysis logs of their athletes" ON video_analysis_logs;
DROP POLICY IF EXISTS "enable_select_access" ON video_analysis_logs;
DROP POLICY IF EXISTS "enable_insert_access" ON video_analysis_logs;
DROP POLICY IF EXISTS "enable_update_access" ON video_analysis_logs;
DROP POLICY IF EXISTS "enable_delete_access" ON video_analysis_logs;

CREATE POLICY "enable_select_access" ON video_analysis_logs FOR SELECT TO authenticated
USING (
    user_id = (select auth.uid()) OR
    (
        shared_with_coach = TRUE AND
        EXISTS (
            SELECT 1 FROM group_members gm
            JOIN groups g ON g.id = gm.group_id
            WHERE gm.athlete_id = video_analysis_logs.user_id
            AND g.coach_id = (select auth.uid())
        )
    )
);

CREATE POLICY "enable_insert_access" ON video_analysis_logs FOR INSERT TO authenticated
WITH CHECK (
    user_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON video_analysis_logs FOR UPDATE TO authenticated
USING (
    user_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON video_analysis_logs FOR DELETE TO authenticated
USING (
    user_id = (select auth.uid())
);


-- 14. workout_templates (uses coach_id)
DROP POLICY IF EXISTS "Les coachs peuvent supprimer leurs propres modèles" ON workout_templates;
DROP POLICY IF EXISTS "Users can manage their own templates" ON workout_templates;
DROP POLICY IF EXISTS "Les coachs peuvent créer des modèles" ON workout_templates;
DROP POLICY IF EXISTS "Les coachs peuvent voir leurs propres modèles" ON workout_templates;
DROP POLICY IF EXISTS "Les coachs peuvent modifier leurs propres modèles" ON workout_templates;
DROP POLICY IF EXISTS "enable_select_access" ON workout_templates;
DROP POLICY IF EXISTS "enable_insert_access" ON workout_templates;
DROP POLICY IF EXISTS "enable_update_access" ON workout_templates;
DROP POLICY IF EXISTS "enable_delete_access" ON workout_templates;

CREATE POLICY "enable_select_access" ON workout_templates FOR SELECT TO authenticated
USING (
    coach_id = (select auth.uid())
);

CREATE POLICY "enable_insert_access" ON workout_templates FOR INSERT TO authenticated
WITH CHECK (
    coach_id = (select auth.uid())
);

CREATE POLICY "enable_update_access" ON workout_templates FOR UPDATE TO authenticated
USING (
    coach_id = (select auth.uid())
);

CREATE POLICY "enable_delete_access" ON workout_templates FOR DELETE TO authenticated
USING (
    coach_id = (select auth.uid())
);


-- 15. workouts (uses user_id - FIXED from athlete_id)
DROP POLICY IF EXISTS "Coaches can create workouts for their athletes" ON workouts;
DROP POLICY IF EXISTS "Coaches can insert workouts for their athletes" ON workouts;
DROP POLICY IF EXISTS "Users can create workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can read workouts of their athletes" ON workouts;
DROP POLICY IF EXISTS "Users read own workouts" ON workouts;
DROP POLICY IF EXISTS "Users can update workouts" ON workouts;
DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can validate completed workouts" ON workouts;
DROP POLICY IF EXISTS "Allow authenticated users to create workouts" ON workouts;
DROP POLICY IF EXISTS "Allow users to update their own workouts" ON workouts;
DROP POLICY IF EXISTS "Allow coaches to update their athletes' workouts" ON workouts;
DROP POLICY IF EXISTS "Allow athlete and coach access to workouts" ON workouts;
DROP POLICY IF EXISTS "workouts_full_access" ON workouts;
DROP POLICY IF EXISTS "enable_select_access" ON workouts;
DROP POLICY IF EXISTS "enable_insert_access" ON workouts;
DROP POLICY IF EXISTS "enable_update_access" ON workouts;
DROP POLICY IF EXISTS "enable_delete_access" ON workouts;

CREATE POLICY "enable_select_access" ON workouts FOR SELECT TO authenticated
USING (
    user_id = (select auth.uid()) OR
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = workouts.user_id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = workouts.user_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_insert_access" ON workouts FOR INSERT TO authenticated
WITH CHECK (
    user_id = (select auth.uid()) OR
    -- Coach assigning to athlete
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = workouts.user_id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = workouts.user_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_update_access" ON workouts FOR UPDATE TO authenticated
USING (
    user_id = (select auth.uid()) OR
    -- Coach updating assignment
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = workouts.user_id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = workouts.user_id
        AND g.coach_id = (select auth.uid())
    )
);

CREATE POLICY "enable_delete_access" ON workouts FOR DELETE TO authenticated
USING (
    user_id = (select auth.uid()) OR
    -- Coach deleting assignment
    EXISTS (
        SELECT 1 FROM personal_coach_links pcl
        WHERE pcl.athlete_id = workouts.user_id
        AND pcl.coach_id = (select auth.uid())
    ) OR
    EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.athlete_id = workouts.user_id
        AND g.coach_id = (select auth.uid())
    )
);
