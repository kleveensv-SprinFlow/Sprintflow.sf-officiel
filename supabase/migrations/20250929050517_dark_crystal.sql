/*
  # Fix RLS policies to prevent infinite recursion

  1. Security Changes
    - Remove all circular policies on profiles and group_members
    - Create simple, direct policies without cross-table references
    - Ensure users can only access their own data

  2. New Policies
    - profiles_own_access: Users can only access their own profile
    - group_members_own_access: Users can only access their own memberships
    - group_members_coach_access: Coaches can manage their group members
*/

-- Supprimer toutes les politiques existantes sur profiles
DROP POLICY IF EXISTS "profiles_own_access" ON profiles;
DROP POLICY IF EXISTS "profiles_simple_access" ON profiles;

-- Supprimer toutes les politiques existantes sur group_members
DROP POLICY IF EXISTS "group_members_coach_access" ON group_members;
DROP POLICY IF EXISTS "group_members_own_access" ON group_members;
DROP POLICY IF EXISTS "group_members_simple_read" ON group_members;
DROP POLICY IF EXISTS "group_members_simple_insert" ON group_members;
DROP POLICY IF EXISTS "group_members_simple_delete" ON group_members;

-- Créer des politiques ultra-simples pour profiles
CREATE POLICY "profiles_basic_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Créer des politiques ultra-simples pour group_members
CREATE POLICY "group_members_basic_access"
  ON group_members
  FOR ALL
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

-- Politique séparée pour les coachs (sans référence circulaire)
CREATE POLICY "group_members_coach_management"
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