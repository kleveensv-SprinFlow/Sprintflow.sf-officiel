/*
  # Correction finale de la récursion infinie dans les politiques RLS

  1. Suppression complète de toutes les politiques récursives
  2. Création de politiques simples sans auto-référence
  3. Accès garanti pour tous les utilisateurs authentifiés
*/

-- Supprimer TOUTES les politiques existantes qui causent la récursion
DROP POLICY IF EXISTS "profiles_full_access" ON profiles;
DROP POLICY IF EXISTS "developer_full_access_profiles" ON profiles;
DROP POLICY IF EXISTS "groups_access" ON groups;
DROP POLICY IF EXISTS "developer_full_access_groups" ON groups;
DROP POLICY IF EXISTS "group_members_access" ON group_members;
DROP POLICY IF EXISTS "developer_full_access_group_members" ON group_members;
DROP POLICY IF EXISTS "body_compositions_extended_access" ON body_compositions;
DROP POLICY IF EXISTS "workouts_extended_access" ON workouts;
DROP POLICY IF EXISTS "records_extended_access" ON records;

-- PROFILES: Politiques simples sans récursion
CREATE POLICY "profiles_own_access" ON profiles
  FOR ALL USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- GROUPS: Politiques simples
CREATE POLICY "groups_coach_full" ON groups
  FOR ALL USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "groups_public_read" ON groups
  FOR SELECT USING (true);

-- GROUP_MEMBERS: Politiques directes sans jointure
CREATE POLICY "group_members_own" ON group_members
  FOR ALL USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "group_members_coach" ON group_members
  FOR SELECT USING (
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

-- BODY_COMPOSITIONS: Accès direct
CREATE POLICY "body_compositions_own" ON body_compositions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- WORKOUTS: Accès direct
CREATE POLICY "workouts_own" ON workouts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RECORDS: Accès direct
CREATE POLICY "records_own" ON records
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- WEEKLY_PLANS: Accès direct
CREATE POLICY "weekly_plans_simple" ON weekly_plans
  FOR ALL USING (
    auth.uid() = coach_id OR auth.uid() = athlete_id
  )
  WITH CHECK (auth.uid() = coach_id);

-- DAILY_SESSIONS: Accès via weekly_plans
CREATE POLICY "daily_sessions_simple" ON daily_sessions
  FOR ALL USING (
    weekly_plan_id IN (
      SELECT id FROM weekly_plans 
      WHERE coach_id = auth.uid() OR athlete_id = auth.uid()
    )
  )
  WITH CHECK (
    weekly_plan_id IN (
      SELECT id FROM weekly_plans WHERE coach_id = auth.uid()
    )
  );

-- SESSION_EXERCISES: Accès via daily_sessions
CREATE POLICY "session_exercises_simple" ON session_exercises
  FOR ALL USING (
    daily_session_id IN (
      SELECT ds.id FROM daily_sessions ds
      JOIN weekly_plans wp ON ds.weekly_plan_id = wp.id
      WHERE wp.coach_id = auth.uid() OR wp.athlete_id = auth.uid()
    )
  )
  WITH CHECK (
    daily_session_id IN (
      SELECT ds.id FROM daily_sessions ds
      JOIN weekly_plans wp ON ds.weekly_plan_id = wp.id
      WHERE wp.coach_id = auth.uid()
    )
  );

-- SESSION_TEMPLATES: Accès coach
CREATE POLICY "session_templates_coach" ON session_templates
  FOR ALL USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

-- CHAT_MESSAGES: Accès personnel
CREATE POLICY "chat_messages_own" ON chat_messages
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- GROUP_CHAT_MESSAGES: Accès simplifié
CREATE POLICY "group_chat_simple" ON group_chat_messages
  FOR SELECT USING (true);

CREATE POLICY "group_chat_insert" ON group_chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SUBSCRIPTIONS: Accès personnel
CREATE POLICY "subscriptions_own" ON subscriptions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- NOTIFICATIONS: Accès personnel
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PARTNERSHIPS: Lecture publique
CREATE POLICY "partnerships_public_read" ON partnerships
  FOR SELECT USING (true);