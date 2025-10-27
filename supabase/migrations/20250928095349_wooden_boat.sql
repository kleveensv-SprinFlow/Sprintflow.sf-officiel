/*
  # Correction complète de l'accès athlète

  1. Politiques RLS
    - Corriger l'accès aux session_templates pour les athlètes
    - Corriger l'accès aux group_chat_messages pour les athlètes
    - Corriger l'accès aux groups pour les athlètes
    - Corriger l'accès aux group_members pour les athlètes

  2. Sécurité
    - Permettre aux athlètes de voir les données de leurs groupes
    - Maintenir la sécurité pour les coachs
*/

-- 1. Corriger la politique pour session_templates (permettre aux athlètes de voir les sessions de leurs groupes)
DROP POLICY IF EXISTS "session_templates_group_policy" ON session_templates;

CREATE POLICY "session_templates_access_policy"
  ON session_templates
  FOR SELECT
  TO authenticated
  USING (
    -- Les coachs peuvent voir leurs propres templates
    (coach_id = auth.uid()) 
    OR 
    -- Les athlètes peuvent voir les templates des groupes dont ils sont membres
    (group_id IN (
      SELECT group_members.group_id 
      FROM group_members 
      WHERE group_members.athlete_id = auth.uid()
    ))
  );

-- 2. Corriger la politique pour group_chat_messages (permettre aux athlètes de voir et envoyer des messages)
DROP POLICY IF EXISTS "group_chat_messages_policy" ON group_chat_messages;

CREATE POLICY "group_chat_messages_read_policy"
  ON group_chat_messages
  FOR SELECT
  TO authenticated
  USING (
    -- Les coachs peuvent voir les messages de leurs groupes
    (group_id IN (
      SELECT groups.id 
      FROM groups 
      WHERE groups.coach_id = auth.uid()
    ))
    OR
    -- Les athlètes peuvent voir les messages des groupes dont ils sont membres
    (group_id IN (
      SELECT group_members.group_id 
      FROM group_members 
      WHERE group_members.athlete_id = auth.uid()
    ))
  );

CREATE POLICY "group_chat_messages_write_policy"
  ON group_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- L'utilisateur doit être le propriétaire du message
    (user_id = auth.uid())
    AND
    -- Et membre du groupe (coach ou athlète)
    (
      (group_id IN (
        SELECT groups.id 
        FROM groups 
        WHERE groups.coach_id = auth.uid()
      ))
      OR
      (group_id IN (
        SELECT group_members.group_id 
        FROM group_members 
        WHERE group_members.athlete_id = auth.uid()
      ))
    )
  );

-- 3. Améliorer la politique pour groups (permettre aux athlètes de voir leurs groupes)
DROP POLICY IF EXISTS "Allow authenticated users to find groups" ON groups;
DROP POLICY IF EXISTS "groups_coach_policy" ON groups;

CREATE POLICY "groups_read_policy"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    -- Les coachs peuvent voir leurs propres groupes
    (coach_id = auth.uid())
    OR
    -- Les athlètes peuvent voir les groupes dont ils sont membres
    (id IN (
      SELECT group_members.group_id 
      FROM group_members 
      WHERE group_members.athlete_id = auth.uid()
    ))
    OR
    -- Permettre la recherche par code d'invitation pour rejoindre
    true
  );

CREATE POLICY "groups_coach_management_policy"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- 4. Corriger la politique pour group_members
DROP POLICY IF EXISTS "group_members_policy" ON group_members;

CREATE POLICY "group_members_read_policy"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    -- Les coachs peuvent voir les membres de leurs groupes
    (group_id IN (
      SELECT groups.id 
      FROM groups 
      WHERE groups.coach_id = auth.uid()
    ))
    OR
    -- Les athlètes peuvent voir les membres des groupes dont ils font partie
    (group_id IN (
      SELECT gm.group_id 
      FROM group_members gm 
      WHERE gm.athlete_id = auth.uid()
    ))
  );

CREATE POLICY "group_members_write_policy"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Les athlètes peuvent se joindre à des groupes
    (athlete_id = auth.uid())
    OR
    -- Les coachs peuvent ajouter des membres à leurs groupes
    (group_id IN (
      SELECT groups.id 
      FROM groups 
      WHERE groups.coach_id = auth.uid()
    ))
  );

CREATE POLICY "group_members_delete_policy"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    -- Les athlètes peuvent quitter leurs groupes
    (athlete_id = auth.uid())
    OR
    -- Les coachs peuvent retirer des membres de leurs groupes
    (group_id IN (
      SELECT groups.id 
      FROM groups 
      WHERE groups.coach_id = auth.uid()
    ))
  );

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_session_templates_group_members 
ON session_templates (group_id);

CREATE INDEX IF NOT EXISTS idx_group_chat_messages_group_members 
ON group_chat_messages (group_id);

-- 6. Fonction pour déboguer l'accès athlète
CREATE OR REPLACE FUNCTION debug_athlete_access(athlete_uuid uuid)
RETURNS TABLE (
  athlete_id uuid,
  group_count bigint,
  group_names text[],
  session_count bigint
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    athlete_uuid as athlete_id,
    COUNT(DISTINCT gm.group_id) as group_count,
    ARRAY_AGG(DISTINCT g.name) as group_names,
    COUNT(DISTINCT st.id) as session_count
  FROM group_members gm
  LEFT JOIN groups g ON g.id = gm.group_id
  LEFT JOIN session_templates st ON st.group_id = gm.group_id
  WHERE gm.athlete_id = athlete_uuid
  GROUP BY athlete_uuid;
END;
$$;