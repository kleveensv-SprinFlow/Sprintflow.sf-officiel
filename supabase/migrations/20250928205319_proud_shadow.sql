/*
  # Corriger la récursion infinie dans les politiques RLS

  1. Problème identifié
    - Récursion infinie détectée dans les politiques de `group_members`
    - Les politiques se référencent mutuellement créant une boucle

  2. Solution
    - Supprimer les politiques problématiques
    - Recréer des politiques simples sans références circulaires
    - Utiliser des conditions directes sans sous-requêtes complexes

  3. Sécurité
    - Maintenir la sécurité avec des politiques plus simples
    - Éviter les jointures complexes dans les politiques RLS
*/

-- Supprimer toutes les politiques existantes sur group_members pour éviter les conflits
DROP POLICY IF EXISTS "group_members_coach_access" ON group_members;
DROP POLICY IF EXISTS "Athletes can join groups" ON group_members;
DROP POLICY IF EXISTS "Athletes can leave their groups" ON group_members;
DROP POLICY IF EXISTS "Athletes can see all members of their groups" ON group_members;
DROP POLICY IF EXISTS "Coaches can manage their group members" ON group_members;

-- Supprimer les politiques problématiques sur profiles
DROP POLICY IF EXISTS "Group members can see each other's profiles" ON profiles;

-- Recréer des politiques simples pour group_members
CREATE POLICY "group_members_simple_read"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    athlete_id = auth.uid() OR 
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "group_members_simple_insert"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "group_members_simple_delete"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (
    athlete_id = auth.uid() OR 
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

-- Politique simple pour profiles - éviter les références circulaires
CREATE POLICY "profiles_simple_access"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    -- Permettre aux coachs de voir leurs athlètes
    id IN (
      SELECT gm.athlete_id 
      FROM group_members gm 
      JOIN groups g ON gm.group_id = g.id 
      WHERE g.coach_id = auth.uid()
    ) OR
    -- Permettre aux athlètes de voir leur coach
    id IN (
      SELECT g.coach_id 
      FROM groups g 
      JOIN group_members gm ON g.id = gm.group_id 
      WHERE gm.athlete_id = auth.uid()
    )
  );

-- Politique simple pour groups
CREATE POLICY "groups_simple_access"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    coach_id = auth.uid() OR
    id IN (
      SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
    )
  );