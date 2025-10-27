/*
  # Correction de la récursion infinie RLS

  1. Suppression de toutes les politiques problématiques
  2. Recréation de politiques simples et efficaces
  3. Nettoyage des index dupliqués
  4. Optimisation des performances
*/

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Les individus peuvent voir leur propre profil." ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

DROP POLICY IF EXISTS "Users can manage own records" ON records;
DROP POLICY IF EXISTS "Users can manage own body compositions" ON body_compositions;
DROP POLICY IF EXISTS "Users can manage own workouts" ON workouts;

DROP POLICY IF EXISTS "Coaches can manage own groups" ON groups;
DROP POLICY IF EXISTS "Athletes can read their groups" ON groups;
DROP POLICY IF EXISTS "Athletes can view their groups" ON groups;

DROP POLICY IF EXISTS "Athletes can manage own memberships" ON group_members;
DROP POLICY IF EXISTS "Athletes can read own memberships" ON group_members;
DROP POLICY IF EXISTS "Athletes can insert own memberships" ON group_members;
DROP POLICY IF EXISTS "Athletes can delete own memberships" ON group_members;
DROP POLICY IF EXISTS "Coaches can manage group members" ON group_members;

DROP POLICY IF EXISTS "Users can manage group chat" ON group_chat_messages;

DROP POLICY IF EXISTS "Coaches can manage weekly plans" ON weekly_plans;
DROP POLICY IF EXISTS "Athletes can view their plans" ON weekly_plans;

DROP POLICY IF EXISTS "Users can manage daily sessions" ON daily_sessions;
DROP POLICY IF EXISTS "Users can manage session exercises" ON session_exercises;
DROP POLICY IF EXISTS "Coaches can manage their own session templates" ON session_templates;

DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;

DROP POLICY IF EXISTS "Users can read own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;

-- Supprimer les index dupliqués
DROP INDEX IF EXISTS idx_group_members_athlete_id_optimized;
DROP INDEX IF EXISTS idx_group_members_group_id_optimized;
DROP INDEX IF EXISTS idx_groups_coach_id_optimized;

-- Créer des politiques simples et efficaces
-- Profiles
CREATE POLICY "profiles_policy" ON profiles
  FOR ALL TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Records
CREATE POLICY "records_policy" ON records
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Body compositions
CREATE POLICY "body_compositions_policy" ON body_compositions
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Workouts
CREATE POLICY "workouts_policy" ON workouts
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Groups - Politique simple pour les coachs
CREATE POLICY "groups_policy" ON groups
  FOR ALL TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

-- Group members - Politique simple
CREATE POLICY "group_members_policy" ON group_members
  FOR ALL TO authenticated
  USING (
    athlete_id = (select auth.uid()) OR 
    group_id IN (
      SELECT id FROM groups WHERE coach_id = (select auth.uid())
    )
  )
  WITH CHECK (
    athlete_id = (select auth.uid()) OR 
    group_id IN (
      SELECT id FROM groups WHERE coach_id = (select auth.uid())
    )
  );

-- Group chat messages
CREATE POLICY "group_chat_policy" ON group_chat_messages
  FOR ALL TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    group_id IN (
      SELECT g.id FROM groups g WHERE g.coach_id = (select auth.uid())
      UNION
      SELECT gm.group_id FROM group_members gm WHERE gm.athlete_id = (select auth.uid())
    )
  )
  WITH CHECK (
    user_id = (select auth.uid()) AND
    group_id IN (
      SELECT g.id FROM groups g WHERE g.coach_id = (select auth.uid())
      UNION
      SELECT gm.group_id FROM group_members gm WHERE gm.athlete_id = (select auth.uid())
    )
  );

-- Weekly plans
CREATE POLICY "weekly_plans_policy" ON weekly_plans
  FOR ALL TO authenticated
  USING (
    coach_id = (select auth.uid()) OR 
    athlete_id = (select auth.uid())
  )
  WITH CHECK (coach_id = (select auth.uid()));

-- Daily sessions
CREATE POLICY "daily_sessions_policy" ON daily_sessions
  FOR ALL TO authenticated
  USING (
    weekly_plan_id IN (
      SELECT id FROM weekly_plans 
      WHERE coach_id = (select auth.uid()) OR athlete_id = (select auth.uid())
    )
  )
  WITH CHECK (
    weekly_plan_id IN (
      SELECT id FROM weekly_plans WHERE coach_id = (select auth.uid())
    )
  );

-- Session exercises
CREATE POLICY "session_exercises_policy" ON session_exercises
  FOR ALL TO authenticated
  USING (
    daily_session_id IN (
      SELECT ds.id FROM daily_sessions ds
      JOIN weekly_plans wp ON ds.weekly_plan_id = wp.id
      WHERE wp.coach_id = (select auth.uid()) OR wp.athlete_id = (select auth.uid())
    )
  )
  WITH CHECK (
    daily_session_id IN (
      SELECT ds.id FROM daily_sessions ds
      JOIN weekly_plans wp ON ds.weekly_plan_id = wp.id
      WHERE wp.coach_id = (select auth.uid())
    )
  );

-- Session templates
CREATE POLICY "session_templates_policy" ON session_templates
  FOR ALL TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

-- Subscriptions
CREATE POLICY "subscriptions_policy" ON subscriptions
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Chat messages
CREATE POLICY "chat_messages_policy" ON chat_messages
  FOR ALL TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Créer la fonction generate_invitation_code si elle n'existe pas
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code text;
  exists_check boolean;
BEGIN
  LOOP
    -- Générer un code de 8 caractères
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Vérifier s'il existe déjà
    SELECT EXISTS(SELECT 1 FROM groups WHERE invitation_code = code) INTO exists_check;
    
    -- Si le code n'existe pas, on peut l'utiliser
    IF NOT exists_check THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Créer la fonction update_updated_at_column si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;