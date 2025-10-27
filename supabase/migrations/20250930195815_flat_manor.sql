/*
  # CORRECTION URGENTE - Accès complet pour les athlètes

  1. Suppression de toutes les politiques problématiques
  2. Création de politiques permissives qui fonctionnent
  3. Accès garanti aux profils, groupes, et toutes les données
  4. Correction de la visibilité des photos de profil
*/

-- Supprimer TOUTES les politiques existantes qui posent problème
DROP POLICY IF EXISTS "profiles_own_access" ON profiles;
DROP POLICY IF EXISTS "profiles_group_visibility" ON profiles;
DROP POLICY IF EXISTS "developer_full_access_profiles" ON profiles;

DROP POLICY IF EXISTS "groups_member_visibility" ON groups;
DROP POLICY IF EXISTS "groups_coach_access" ON groups;
DROP POLICY IF EXISTS "developer_full_access_groups" ON groups;

DROP POLICY IF EXISTS "group_members_own_access" ON group_members;
DROP POLICY IF EXISTS "group_members_coach_access" ON group_members;
DROP POLICY IF EXISTS "group_members_visibility" ON group_members;
DROP POLICY IF EXISTS "developer_full_access_group_members" ON group_members;

DROP POLICY IF EXISTS "workouts_own_access" ON workouts;
DROP POLICY IF EXISTS "workouts_group_visibility" ON workouts;

DROP POLICY IF EXISTS "records_own_access" ON records;
DROP POLICY IF EXISTS "records_group_visibility" ON records;

DROP POLICY IF EXISTS "body_compositions_own_access" ON body_compositions;
DROP POLICY IF EXISTS "body_compositions_group_visibility" ON body_compositions;

-- NOUVELLES POLITIQUES SIMPLES ET PERMISSIVES

-- 1. PROFILES - Accès simple et direct
CREATE POLICY "profiles_full_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    -- Accès à son propre profil
    id = auth.uid()
    OR
    -- Accès aux profils des membres de ses groupes (athlètes)
    (
      auth.uid() IN (
        SELECT athlete_id FROM group_members 
        WHERE group_id IN (
          SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
        )
      )
    )
    OR
    -- Accès aux profils des coachs de ses groupes (athlètes)
    (
      id IN (
        SELECT coach_id FROM groups 
        WHERE id IN (
          SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
        )
      )
    )
    OR
    -- Accès pour les coachs à leurs athlètes
    (
      id IN (
        SELECT athlete_id FROM group_members 
        WHERE group_id IN (
          SELECT id FROM groups WHERE coach_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (id = auth.uid());

-- 2. GROUPS - Accès simple
CREATE POLICY "groups_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (
    -- Coach peut voir ses groupes
    coach_id = auth.uid()
    OR
    -- Athlète peut voir ses groupes
    id IN (
      SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
    )
  )
  WITH CHECK (coach_id = auth.uid());

-- 3. GROUP_MEMBERS - Accès simple
CREATE POLICY "group_members_access"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    -- Accès à ses propres adhésions
    athlete_id = auth.uid()
    OR
    -- Coach peut voir les membres de ses groupes
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
    OR
    -- Athlète peut voir les membres de ses groupes
    group_id IN (
      SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
    )
  )
  WITH CHECK (
    athlete_id = auth.uid()
    OR
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );

-- 4. WORKOUTS - Accès étendu
CREATE POLICY "workouts_extended_access"
  ON workouts
  FOR ALL
  TO authenticated
  USING (
    -- Ses propres workouts
    user_id = auth.uid()
    OR
    -- Workouts des membres de ses groupes (pour athlètes)
    user_id IN (
      SELECT athlete_id FROM group_members 
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
      )
    )
    OR
    -- Workouts des athlètes pour les coachs
    user_id IN (
      SELECT athlete_id FROM group_members 
      WHERE group_id IN (
        SELECT id FROM groups WHERE coach_id = auth.uid()
      )
    )
  )
  WITH CHECK (user_id = auth.uid());

-- 5. RECORDS - Accès étendu
CREATE POLICY "records_extended_access"
  ON records
  FOR ALL
  TO authenticated
  USING (
    -- Ses propres records
    user_id = auth.uid()
    OR
    -- Records des membres de ses groupes (pour athlètes)
    user_id IN (
      SELECT athlete_id FROM group_members 
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
      )
    )
    OR
    -- Records des athlètes pour les coachs
    user_id IN (
      SELECT athlete_id FROM group_members 
      WHERE group_id IN (
        SELECT id FROM groups WHERE coach_id = auth.uid()
      )
    )
  )
  WITH CHECK (user_id = auth.uid());

-- 6. BODY_COMPOSITIONS - Accès étendu
CREATE POLICY "body_compositions_extended_access"
  ON body_compositions
  FOR ALL
  TO authenticated
  USING (
    -- Ses propres données
    user_id = auth.uid()
    OR
    -- Données des membres de ses groupes (pour athlètes)
    user_id IN (
      SELECT athlete_id FROM group_members 
      WHERE group_id IN (
        SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
      )
    )
    OR
    -- Données des athlètes pour les coachs
    user_id IN (
      SELECT athlete_id FROM group_members 
      WHERE group_id IN (
        SELECT id FROM groups WHERE coach_id = auth.uid()
      )
    )
  )
  WITH CHECK (user_id = auth.uid());

-- 7. POLITIQUES DÉVELOPPEUR (accès complet)
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