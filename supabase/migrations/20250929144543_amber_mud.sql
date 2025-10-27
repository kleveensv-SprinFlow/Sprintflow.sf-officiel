/*
  # Correction finale de la récursion infinie RLS

  1. Problème identifié
    - Récursion infinie entre les politiques des tables `groups` et `group_members`
    - Les politiques se référencent mutuellement créant une boucle

  2. Solution appliquée
    - Suppression complète de toutes les politiques existantes
    - Recréation de politiques ultra-simples sans jointures complexes
    - Séparation claire des permissions par rôle

  3. Nouvelles politiques
    - `groups`: Accès direct par `coach_id` uniquement
    - `group_members`: Accès direct par `athlete_id` et vérification coach simple
*/

-- Désactiver RLS temporairement pour nettoyer
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes sur groups
DROP POLICY IF EXISTS "groups_coach_only" ON groups;
DROP POLICY IF EXISTS "groups_owner_only" ON groups;
DROP POLICY IF EXISTS "groups_coach_all_access" ON groups;
DROP POLICY IF EXISTS "developer_full_access_groups" ON groups;
DROP POLICY IF EXISTS "groups_athlete_read" ON groups;

-- Supprimer TOUTES les politiques existantes sur group_members
DROP POLICY IF EXISTS "group_members_athlete_only" ON group_members;
DROP POLICY IF EXISTS "group_members_self_only" ON group_members;
DROP POLICY IF EXISTS "group_members_coach_manage" ON group_members;
DROP POLICY IF EXISTS "developer_full_access_members" ON group_members;
DROP POLICY IF EXISTS "group_members_athlete_read" ON group_members;
DROP POLICY IF EXISTS "group_members_coach_access" ON group_members;
DROP POLICY IF EXISTS "group_members_coach_direct" ON group_members;
DROP POLICY IF EXISTS "group_members_athlete_access" ON group_members;

-- Réactiver RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Créer des politiques ultra-simples pour groups (SANS JOINTURES)
CREATE POLICY "groups_coach_simple"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Créer des politiques ultra-simples pour group_members (SANS JOINTURES COMPLEXES)
CREATE POLICY "group_members_athlete_simple"
  ON group_members
  FOR ALL
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Politique coach pour group_members (jointure simple sans récursion)
CREATE POLICY "group_members_coach_simple"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id 
      AND groups.coach_id = auth.uid()
    )
  );

-- Politique développeur pour debug (accès complet)
CREATE POLICY "developer_groups_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

CREATE POLICY "developer_members_access"
  ON group_members
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

-- Vérifier que la fonction de génération de code existe
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$;

-- S'assurer que le trigger existe
DROP TRIGGER IF EXISTS groups_invitation_code_trigger ON groups;
CREATE TRIGGER groups_invitation_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  WHEN (NEW.invitation_code IS NULL)
  EXECUTE FUNCTION set_invitation_code_on_insert();

-- Vérifier la fonction du trigger
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