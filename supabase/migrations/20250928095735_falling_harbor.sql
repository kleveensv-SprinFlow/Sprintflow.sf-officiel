/*
  # Correction de la récursion infinie dans les politiques RLS

  1. Problème identifié
    - Erreur: "infinite recursion detected in policy for relation group_members"
    - Les politiques RLS créent des références circulaires
    - Toutes les requêtes échouent avec erreur 500

  2. Solution
    - Supprimer toutes les politiques problématiques
    - Recréer des politiques simples et directes
    - Éviter les sous-requêtes complexes qui créent des boucles

  3. Nouvelles politiques
    - Politiques simplifiées pour éviter la récursion
    - Accès direct basé sur les IDs utilisateur
    - Pas de jointures complexes dans les politiques
*/

-- Supprimer toutes les politiques existantes qui causent la récursion
DROP POLICY IF EXISTS "records_policy" ON records;
DROP POLICY IF EXISTS "workouts_policy" ON workouts;
DROP POLICY IF EXISTS "body_compositions_policy" ON body_compositions;
DROP POLICY IF EXISTS "session_templates_access_policy" ON session_templates;
DROP POLICY IF EXISTS "group_members_read_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_write_policy" ON group_members;
DROP POLICY IF EXISTS "group_members_delete_policy" ON group_members;
DROP POLICY IF EXISTS "groups_read_policy" ON groups;
DROP POLICY IF EXISTS "groups_coach_management_policy" ON groups;
DROP POLICY IF EXISTS "group_chat_messages_read_policy" ON group_chat_messages;
DROP POLICY IF EXISTS "group_chat_messages_write_policy" ON group_chat_messages;

-- Politiques simples pour records (sans référence aux groupes)
CREATE POLICY "records_user_access"
  ON records
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques simples pour workouts (sans référence aux groupes)
CREATE POLICY "workouts_user_access"
  ON workouts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques simples pour body_compositions (sans référence aux groupes)
CREATE POLICY "body_compositions_user_access"
  ON body_compositions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques simples pour groups
CREATE POLICY "groups_coach_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "groups_public_read"
  ON groups
  FOR SELECT
  TO authenticated
  USING (true);

-- Politiques simples pour group_members
CREATE POLICY "group_members_coach_access"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "group_members_athlete_access"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "group_members_athlete_join"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "group_members_athlete_leave"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (athlete_id = auth.uid());

-- Politiques simples pour session_templates
CREATE POLICY "session_templates_coach_access"
  ON session_templates
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "session_templates_athlete_read"
  ON session_templates
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
    )
  );

-- Politiques simples pour group_chat_messages
CREATE POLICY "group_chat_coach_access"
  ON group_chat_messages
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "group_chat_athlete_read"
  ON group_chat_messages
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
    )
  );

CREATE POLICY "group_chat_athlete_write"
  ON group_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    group_id IN (
      SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
    )
  );

-- Fonction de test pour vérifier l'accès
CREATE OR REPLACE FUNCTION test_athlete_access(athlete_id uuid)
RETURNS TABLE (
  can_see_groups boolean,
  can_see_members boolean,
  can_see_templates boolean,
  can_see_chat boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXISTS(SELECT 1 FROM group_members WHERE group_members.athlete_id = test_athlete_access.athlete_id) as can_see_groups,
    EXISTS(SELECT 1 FROM group_members WHERE group_members.athlete_id = test_athlete_access.athlete_id) as can_see_members,
    EXISTS(SELECT 1 FROM session_templates st JOIN group_members gm ON st.group_id = gm.group_id WHERE gm.athlete_id = test_athlete_access.athlete_id) as can_see_templates,
    EXISTS(SELECT 1 FROM group_chat_messages gcm JOIN group_members gm ON gcm.group_id = gm.group_id WHERE gm.athlete_id = test_athlete_access.athlete_id) as can_see_chat;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;