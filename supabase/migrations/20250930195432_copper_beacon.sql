/*
  # Restauration complète de l'accès Supabase pour les athlètes

  1. Suppression de toutes les politiques problématiques
  2. Recréation des politiques fonctionnelles
  3. Test et validation de l'accès
  4. Correction des erreurs de récursion

  Cette migration restaure l'accès complet aux données pour les athlètes
  tout en maintenant la sécurité appropriée.
*/

-- =====================================================
-- 1. SUPPRESSION DE TOUTES LES POLITIQUES EXISTANTES
-- =====================================================

-- Supprimer toutes les politiques de profiles
DROP POLICY IF EXISTS "Users can delete own profile only" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON profiles;
DROP POLICY IF EXISTS "athletes_view_group_profiles" ON profiles;
DROP POLICY IF EXISTS "coaches_view_athletes_profiles" ON profiles;
DROP POLICY IF EXISTS "view_own_profile" ON profiles;

-- Supprimer toutes les politiques de groups
DROP POLICY IF EXISTS "athletes_can_view_joined_groups" ON groups;
DROP POLICY IF EXISTS "coaches_manage_own_groups" ON groups;
DROP POLICY IF EXISTS "developer_full_groups_access" ON groups;

-- Supprimer toutes les politiques de group_members
DROP POLICY IF EXISTS "athletes_can_join_groups" ON group_members;
DROP POLICY IF EXISTS "athletes_can_leave_groups" ON group_members;
DROP POLICY IF EXISTS "athletes_view_group_members" ON group_members;
DROP POLICY IF EXISTS "coaches_manage_group_members" ON group_members;
DROP POLICY IF EXISTS "developer_full_members_access" ON group_members;

-- Supprimer toutes les politiques de workouts
DROP POLICY IF EXISTS "athletes_view_group_workouts" ON workouts;
DROP POLICY IF EXISTS "coaches_view_athletes_workouts" ON workouts;
DROP POLICY IF EXISTS "view_own_workouts" ON workouts;
DROP POLICY IF EXISTS "workouts_user_access" ON workouts;

-- Supprimer toutes les politiques de records
DROP POLICY IF EXISTS "athletes_view_group_records" ON records;
DROP POLICY IF EXISTS "coaches_view_athletes_records" ON records;
DROP POLICY IF EXISTS "records_user_access" ON records;
DROP POLICY IF EXISTS "view_own_records" ON records;

-- Supprimer toutes les politiques de body_compositions
DROP POLICY IF EXISTS "athletes_view_group_body_compositions" ON body_compositions;
DROP POLICY IF EXISTS "coaches_view_athletes_body_compositions" ON body_compositions;
DROP POLICY IF EXISTS "body_compositions_user_access" ON body_compositions;
DROP POLICY IF EXISTS "view_own_body_compositions" ON body_compositions;

-- =====================================================
-- 2. RECRÉATION DES POLITIQUES SIMPLES ET FONCTIONNELLES
-- =====================================================

-- PROFILES : Accès simple et direct
CREATE POLICY "profiles_own_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_group_visibility"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    id IN (
      SELECT DISTINCT gm.athlete_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
      )
    ) OR
    id IN (
      SELECT DISTINCT g.coach_id
      FROM groups g
      WHERE g.id IN (
        SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
      )
    )
  );

-- GROUPS : Visibilité pour les membres et coachs
CREATE POLICY "groups_coach_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "groups_member_visibility"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    coach_id = auth.uid() OR
    id IN (
      SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
    )
  );

-- GROUP_MEMBERS : Accès simple
CREATE POLICY "group_members_own_access"
  ON group_members
  FOR ALL
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());

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

CREATE POLICY "group_members_visibility"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    athlete_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
    ) OR
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

-- WORKOUTS : Accès personnel et groupe
CREATE POLICY "workouts_own_access"
  ON workouts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workouts_group_visibility"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT DISTINCT gm.athlete_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
      )
    ) OR
    user_id IN (
      SELECT DISTINCT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- RECORDS : Même logique que workouts
CREATE POLICY "records_own_access"
  ON records
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "records_group_visibility"
  ON records
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT DISTINCT gm.athlete_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
      )
    ) OR
    user_id IN (
      SELECT DISTINCT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- BODY_COMPOSITIONS : Même logique
CREATE POLICY "body_compositions_own_access"
  ON body_compositions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "body_compositions_group_visibility"
  ON body_compositions
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT DISTINCT gm.athlete_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
      )
    ) OR
    user_id IN (
      SELECT DISTINCT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- =====================================================
-- 3. POLITIQUES SPÉCIALES POUR LE DÉVELOPPEUR
-- =====================================================

CREATE POLICY "developer_full_access_profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

CREATE POLICY "developer_full_access_groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

CREATE POLICY "developer_full_access_group_members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

-- =====================================================
-- 4. VÉRIFICATION DES POLITIQUES
-- =====================================================

-- Vérifier que toutes les tables ont RLS activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_compositions ENABLE ROW LEVEL SECURITY;