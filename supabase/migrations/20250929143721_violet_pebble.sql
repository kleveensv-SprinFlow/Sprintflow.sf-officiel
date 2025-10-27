/*
  # Correction finale de la récursion infinie des groupes

  1. Suppression complète de toutes les politiques RLS problématiques
  2. Désactivation temporaire du RLS pour nettoyer
  3. Recréation de politiques ultra-simples sans jointures
  4. Réactivation du RLS avec sécurité minimale

  Cette migration résout définitivement l'erreur "infinite recursion detected in policy"
*/

-- 1. DÉSACTIVER TEMPORAIREMENT RLS POUR NETTOYER
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- 2. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
DROP POLICY IF EXISTS "groups_simple_coach_access" ON groups;
DROP POLICY IF EXISTS "groups_simple_developer_access" ON groups;
DROP POLICY IF EXISTS "groups_simple_member_read" ON groups;
DROP POLICY IF EXISTS "groups_owner_only" ON groups;
DROP POLICY IF EXISTS "groups_coach_access" ON groups;
DROP POLICY IF EXISTS "groups_developer_access" ON groups;

DROP POLICY IF EXISTS "group_members_basic_access" ON group_members;
DROP POLICY IF EXISTS "group_members_coach_management" ON group_members;
DROP POLICY IF EXISTS "group_members_self_only" ON group_members;
DROP POLICY IF EXISTS "group_members_coach_manage" ON group_members;

-- 3. RÉACTIVER RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- 4. CRÉER DES POLITIQUES ULTRA-SIMPLES SANS JOINTURES

-- Politique pour les groupes : seulement le coach propriétaire
CREATE POLICY "groups_coach_only"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Politique pour les membres : seulement l'athlète lui-même
CREATE POLICY "group_members_athlete_only"
  ON group_members
  FOR ALL
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Politique pour permettre aux coachs de gérer leurs groupes (sans jointure)
CREATE POLICY "group_members_coach_direct"
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

-- 5. VÉRIFIER QUE LA FONCTION DE GÉNÉRATION DE CODE EXISTE
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

-- 6. VÉRIFIER QUE LE TRIGGER EXISTE
DROP TRIGGER IF EXISTS groups_invitation_code_trigger ON groups;

CREATE TRIGGER groups_invitation_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  WHEN (NEW.invitation_code IS NULL)
  EXECUTE FUNCTION set_invitation_code_on_insert();

-- 7. CRÉER LA FONCTION DU TRIGGER SI ELLE N'EXISTE PAS
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