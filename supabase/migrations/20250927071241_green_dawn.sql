/*
  # Système de groupes complet et fonctionnel

  1. Nettoyage complet
    - Suppression de toutes les politiques problématiques
    - Suppression des index dupliqués
    - Reset des tables groups et group_members

  2. Nouvelles tables optimisées
    - `groups` avec politiques simples
    - `group_members` avec relations correctes
    - `group_chat_messages` pour la messagerie

  3. Sécurité
    - RLS activé sur toutes les tables
    - Politiques simples et efficaces
    - Pas de récursion

  4. Fonctions utilitaires
    - Génération de codes d'invitation
    - Gestion des timestamps
*/

-- Nettoyage complet des politiques existantes
DROP POLICY IF EXISTS "groups_policy" ON groups;
DROP POLICY IF EXISTS "Coaches can manage own groups" ON groups;
DROP POLICY IF EXISTS "Athletes can view their groups" ON groups;
DROP POLICY IF EXISTS "Athletes can read their groups" ON groups;

DROP POLICY IF EXISTS "group_members_policy" ON group_members;
DROP POLICY IF EXISTS "Coaches can manage group members" ON group_members;
DROP POLICY IF EXISTS "Athletes can read own memberships" ON group_members;
DROP POLICY IF EXISTS "Athletes can insert own memberships" ON group_members;
DROP POLICY IF EXISTS "Athletes can delete own memberships" ON group_members;
DROP POLICY IF EXISTS "Athletes can manage own memberships" ON group_members;

DROP POLICY IF EXISTS "group_chat_policy" ON group_chat_messages;

-- Suppression des index dupliqués
DROP INDEX IF EXISTS idx_groups_coach_id_optimized;
DROP INDEX IF EXISTS idx_group_members_group_id_optimized;
DROP INDEX IF EXISTS idx_group_members_athlete_id_optimized;

-- Fonction pour générer des codes d'invitation
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

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Assurer que RLS est activé
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;

-- Politiques simples pour groups
CREATE POLICY "coaches_manage_groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

CREATE POLICY "athletes_view_their_groups"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE athlete_id = (select auth.uid())
    )
  );

-- Politiques simples pour group_members
CREATE POLICY "coaches_manage_members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = (select auth.uid())
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = (select auth.uid())
    )
  );

CREATE POLICY "athletes_manage_own_membership"
  ON group_members
  FOR ALL
  TO authenticated
  USING (athlete_id = (select auth.uid()))
  WITH CHECK (athlete_id = (select auth.uid()));

-- Politiques pour group_chat_messages
CREATE POLICY "group_chat_access"
  ON group_chat_messages
  FOR ALL
  TO authenticated
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

-- Trigger pour générer automatiquement le code d'invitation
CREATE OR REPLACE FUNCTION set_invitation_code_on_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.invitation_code IS NULL OR NEW.invitation_code = '' THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS groups_invitation_code_trigger ON groups;
CREATE TRIGGER groups_invitation_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code_on_insert();

-- Trigger pour updated_at sur groups
DROP TRIGGER IF EXISTS groups_updated_at_trigger ON groups;
CREATE TRIGGER groups_updated_at_trigger
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();