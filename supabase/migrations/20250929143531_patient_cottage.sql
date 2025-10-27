/*
  # Correction complète de la récursion infinie dans les politiques RLS

  1. Suppression de toutes les politiques problématiques
  2. Recréation de politiques simples sans récursion
  3. Désactivation temporaire de RLS pour déblocage
  4. Vérification de la structure des tables
*/

-- Désactiver RLS temporairement pour déblocage
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes qui causent la récursion
DROP POLICY IF EXISTS "groups_simple_coach_access" ON groups;
DROP POLICY IF EXISTS "groups_simple_developer_access" ON groups;
DROP POLICY IF EXISTS "groups_simple_member_read" ON groups;
DROP POLICY IF EXISTS "group_members_basic_access" ON group_members;
DROP POLICY IF EXISTS "group_members_coach_management" ON group_members;

-- Vérifier que la fonction de génération de code existe
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;

-- Vérifier que le trigger existe
DROP TRIGGER IF EXISTS groups_invitation_code_trigger ON groups;
CREATE TRIGGER groups_invitation_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  WHEN (NEW.invitation_code IS NULL)
  EXECUTE FUNCTION set_invitation_code_on_insert();

-- Réactiver RLS avec des politiques ultra-simples
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Politique ultra-simple pour les groupes : SEULEMENT le coach propriétaire
CREATE POLICY "groups_owner_only"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Politique ultra-simple pour les membres : SEULEMENT l'athlète lui-même
CREATE POLICY "group_members_self_only"
  ON group_members
  FOR ALL
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Politique pour permettre aux coachs de gérer leurs membres
CREATE POLICY "group_members_coach_manage"
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

-- Accès développeur complet (sans récursion)
CREATE POLICY "developer_full_access_groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

CREATE POLICY "developer_full_access_members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);