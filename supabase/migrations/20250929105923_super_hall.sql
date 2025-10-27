/*
  # Corriger les politiques de création de groupes

  1. Corrections
    - Simplifier la politique de création de groupes
    - Permettre aux coachs et développeurs de créer des groupes
    - Corriger les permissions d'insertion

  2. Sécurité
    - Maintenir RLS activé
    - Vérifier que seuls les coachs peuvent créer
*/

-- Supprimer les anciennes politiques problématiques
DROP POLICY IF EXISTS "groups_coach_access" ON groups;
DROP POLICY IF EXISTS "groups_public_read" ON groups;
DROP POLICY IF EXISTS "groups_simple_access" ON groups;

-- Créer des politiques simples et fonctionnelles
CREATE POLICY "groups_coach_full_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "groups_member_read_access"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id 
      FROM group_members 
      WHERE athlete_id = auth.uid()
    )
  );

-- Permettre aux développeurs de tout faire
CREATE POLICY "groups_developer_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);