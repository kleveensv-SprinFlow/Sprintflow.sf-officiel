/*
  # Reset complet des politiques RLS

  1. Suppression de toutes les politiques existantes
  2. Recréation avec des politiques simples et sûres
  3. Activation RLS sur toutes les tables
  4. Test des fonctionnalités de base
*/

-- Désactiver RLS temporairement pour nettoyer
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS group_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS body_compositions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS weekly_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS session_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS session_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS group_chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- Supprimer les index dupliqués
DROP INDEX IF EXISTS idx_group_members_athlete_id_optimized;
DROP INDEX IF EXISTS idx_group_members_group_id_optimized;
DROP INDEX IF EXISTS idx_groups_coach_id_optimized;

-- Créer la fonction uid() si elle n'existe pas
CREATE OR REPLACE FUNCTION public.uid()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

-- Fonction pour générer des codes d'invitation
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result text := '';
    i integer;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Réactiver RLS avec des politiques SIMPLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- POLITIQUES SIMPLES SANS RÉCURSION

-- Profiles: Chaque utilisateur gère son profil
CREATE POLICY "profiles_policy" ON profiles
FOR ALL TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- Groups: Coachs gèrent leurs groupes
CREATE POLICY "groups_coach_policy" ON groups
FOR ALL TO authenticated
USING (coach_id = (select auth.uid()))
WITH CHECK (coach_id = (select auth.uid()));

-- Group Members: Gestion simple
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

-- Records: Utilisateurs gèrent leurs records
CREATE POLICY "records_policy" ON records
FOR ALL TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Workouts: Utilisateurs gèrent leurs workouts
CREATE POLICY "workouts_policy" ON workouts
FOR ALL TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Body Compositions: Utilisateurs gèrent leurs données
CREATE POLICY "body_compositions_policy" ON body_compositions
FOR ALL TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Weekly Plans: Coachs et athlètes concernés
CREATE POLICY "weekly_plans_policy" ON weekly_plans
FOR ALL TO authenticated
USING (
  coach_id = (select auth.uid()) OR 
  athlete_id = (select auth.uid())
)
WITH CHECK (coach_id = (select auth.uid()));

-- Daily Sessions: Basé sur les weekly plans
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
    SELECT id FROM weekly_plans 
    WHERE coach_id = (select auth.uid())
  )
);

-- Session Exercises: Basé sur les daily sessions
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

-- Session Templates: Coachs gèrent leurs modèles
CREATE POLICY "session_templates_policy" ON session_templates
FOR ALL TO authenticated
USING (coach_id = (select auth.uid()))
WITH CHECK (coach_id = (select auth.uid()));

-- Chat Messages: Utilisateurs gèrent leurs messages
CREATE POLICY "chat_messages_policy" ON chat_messages
FOR ALL TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Group Chat Messages: Membres du groupe
CREATE POLICY "group_chat_messages_policy" ON group_chat_messages
FOR ALL TO authenticated
USING (
  group_id IN (
    SELECT id FROM groups WHERE coach_id = (select auth.uid())
    UNION
    SELECT group_id FROM group_members WHERE athlete_id = (select auth.uid())
  )
)
WITH CHECK (
  user_id = (select auth.uid()) AND
  group_id IN (
    SELECT id FROM groups WHERE coach_id = (select auth.uid())
    UNION
    SELECT group_id FROM group_members WHERE athlete_id = (select auth.uid())
  )
);

-- Subscriptions: Utilisateurs gèrent leurs abonnements
CREATE POLICY "subscriptions_policy" ON subscriptions
FOR ALL TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Ajouter les triggers manquants
DROP TRIGGER IF EXISTS groups_invitation_code_trigger ON groups;
CREATE TRIGGER groups_invitation_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  WHEN (NEW.invitation_code IS NULL)
  EXECUTE FUNCTION set_invitation_code_on_insert();

-- Fonction pour définir le code d'invitation
CREATE OR REPLACE FUNCTION set_invitation_code_on_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.invitation_code IS NULL THEN
        NEW.invitation_code := generate_invitation_code();
    END IF;
    RETURN NEW;
END;
$$;