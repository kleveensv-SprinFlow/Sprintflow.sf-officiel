/*
  # Correction complète de la sécurité RLS

  1. Activation RLS sur toutes les tables
    - `records` - Activer RLS et ajouter politiques
    - `body_compositions` - Activer RLS et ajouter politiques  
    - `weekly_plans` - Activer RLS et ajouter politiques
    - `daily_sessions` - Activer RLS et ajouter politiques
    - `session_exercises` - Activer RLS et ajouter politiques
    - `groups` - Activer RLS et ajouter politiques
    - `group_members` - Activer RLS et ajouter politiques
    - `workouts` - Activer RLS et ajouter politiques
    - `group_chat_messages` - Activer RLS et ajouter politiques

  2. Politiques de sécurité
    - Utilisateurs peuvent gérer leurs propres données
    - Coachs peuvent gérer leurs groupes et athlètes
    - Athlètes peuvent voir leurs données et groupes
*/

-- Activer RLS sur toutes les tables
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_compositions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can manage own records" ON records;
DROP POLICY IF EXISTS "Users can manage own body compositions" ON body_compositions;
DROP POLICY IF EXISTS "Users can manage own workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can manage weekly plans" ON weekly_plans;
DROP POLICY IF EXISTS "Athletes can view their plans" ON weekly_plans;
DROP POLICY IF EXISTS "Users can manage daily sessions" ON daily_sessions;
DROP POLICY IF EXISTS "Users can manage session exercises" ON session_exercises;
DROP POLICY IF EXISTS "Coaches can manage own groups" ON groups;
DROP POLICY IF EXISTS "Athletes can view their groups" ON groups;
DROP POLICY IF EXISTS "Users can manage group memberships" ON group_members;
DROP POLICY IF EXISTS "Coaches can manage group members" ON group_members;
DROP POLICY IF EXISTS "Users can manage group chat" ON group_chat_messages;

-- Politiques pour records
CREATE POLICY "Users can manage own records"
  ON records
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques pour body_compositions
CREATE POLICY "Users can manage own body compositions"
  ON body_compositions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques pour workouts
CREATE POLICY "Users can manage own workouts"
  ON workouts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques pour weekly_plans
CREATE POLICY "Coaches can manage weekly plans"
  ON weekly_plans
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Athletes can view their plans"
  ON weekly_plans
  FOR SELECT
  TO authenticated
  USING (athlete_id = auth.uid());

-- Politiques pour daily_sessions
CREATE POLICY "Users can manage daily sessions"
  ON daily_sessions
  FOR ALL
  TO authenticated
  USING (
    weekly_plan_id IN (
      SELECT id FROM weekly_plans 
      WHERE coach_id = auth.uid() OR athlete_id = auth.uid()
    )
  )
  WITH CHECK (
    weekly_plan_id IN (
      SELECT id FROM weekly_plans 
      WHERE coach_id = auth.uid()
    )
  );

-- Politiques pour session_exercises
CREATE POLICY "Users can manage session exercises"
  ON session_exercises
  FOR ALL
  TO authenticated
  USING (
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

-- Politiques pour groups
CREATE POLICY "Coaches can manage own groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Athletes can view their groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE athlete_id = auth.uid()
    )
  );

-- Politiques pour group_members
CREATE POLICY "Coaches can manage group members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM groups 
      WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups 
      WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can manage own memberships"
  ON group_members
  FOR ALL
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Politiques pour group_chat_messages
CREATE POLICY "Users can manage group chat"
  ON group_chat_messages
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT g.id FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid() OR gm.athlete_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT g.id FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid() OR gm.athlete_id = auth.uid()
    )
  );

-- Fonction pour générer des codes d'invitation si elle n'existe pas
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$;

-- Fonction pour mettre à jour updated_at si elle n'existe pas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;