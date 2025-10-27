/*
  # Correction récursion infinie création groupes

  1. Problème identifié
    - Récursion infinie dans les politiques RLS de la table `groups`
    - Empêche la création de nouveaux groupes

  2. Solution
    - Suppression de toutes les politiques RLS problématiques
    - Création de politiques ultra-simples sans récursion
    - Test des permissions de base

  3. Sécurité
    - Politiques directes basées sur `auth.uid()`
    - Pas de jointures complexes
    - Accès développeur maintenu
*/

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "groups_coach_full_access" ON groups;
DROP POLICY IF EXISTS "groups_developer_access" ON groups;
DROP POLICY IF EXISTS "groups_member_read_access" ON groups;

-- Créer des politiques ultra-simples sans récursion
CREATE POLICY "groups_simple_coach_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "groups_simple_developer_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

-- Politique de lecture pour les membres (sans jointure complexe)
CREATE POLICY "groups_simple_member_read"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.athlete_id = auth.uid()
    )
  );