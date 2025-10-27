/*
  # Correction complète des politiques RLS pour l'accès aux groupes

  1. Politiques Groupes
    - Les athlètes peuvent voir les groupes qu'ils ont rejoints
    - Les coachs peuvent gérer leurs propres groupes
    - Accès développeur maintenu

  2. Politiques Group Members
    - Les athlètes voient les membres de leurs groupes
    - Les coachs voient les membres de leurs groupes
    - Pas de récursion infinie

  3. Politiques Profiles
    - Visibilité des profils des membres du même groupe
    - Accès coach aux profils de ses athlètes

  4. Politiques Données
    - Accès aux workouts, records et body_compositions des membres du groupe
*/

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Athletes can view their groups with full details" ON groups;
DROP POLICY IF EXISTS "Coaches can manage their own groups" ON groups;
DROP POLICY IF EXISTS "Developer full access to groups" ON groups;
DROP POLICY IF EXISTS "Allow authenticated users to read groups" ON groups;

DROP POLICY IF EXISTS "Athletes can view all members of their groups" ON group_members;
DROP POLICY IF EXISTS "group_members_coach_simple" ON group_members;
DROP POLICY IF EXISTS "developer_members_access" ON group_members;

DROP POLICY IF EXISTS "Athletes can view group members profiles" ON profiles;
DROP POLICY IF EXISTS "Coaches can view their athletes profiles" ON profiles;

DROP POLICY IF EXISTS "Athletes can view group members workouts" ON workouts;
DROP POLICY IF EXISTS "workouts_coach_access" ON workouts;

DROP POLICY IF EXISTS "Athletes can view group members body compositions" ON body_compositions;
DROP POLICY IF EXISTS "body_compositions_coach_access" ON body_compositions;

DROP POLICY IF EXISTS "Athletes can view group members records" ON records;
DROP POLICY IF EXISTS "records_coach_access" ON records;

-- POLITIQUES GROUPES (sans récursion)
CREATE POLICY "athletes_can_view_joined_groups"
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

CREATE POLICY "coaches_manage_own_groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

CREATE POLICY "developer_full_groups_access"
  ON groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

-- POLITIQUES GROUP_MEMBERS (sans récursion)
CREATE POLICY "athletes_view_group_members"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id 
      FROM group_members gm 
      WHERE gm.athlete_id = auth.uid()
    )
  );

CREATE POLICY "coaches_manage_group_members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "athletes_can_join_groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (athlete_id = auth.uid());

CREATE POLICY "athletes_can_leave_groups"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (athlete_id = auth.uid());

CREATE POLICY "developer_full_members_access"
  ON group_members
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

-- POLITIQUES PROFILES (accès aux profils des membres du groupe)
CREATE POLICY "view_own_profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "athletes_view_group_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
    OR
    id IN (
      SELECT g.coach_id
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.athlete_id = auth.uid()
    )
  );

CREATE POLICY "coaches_view_athletes_profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- POLITIQUES WORKOUTS
CREATE POLICY "view_own_workouts"
  ON workouts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athletes_view_group_workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
  );

CREATE POLICY "coaches_view_athletes_workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- POLITIQUES BODY_COMPOSITIONS
CREATE POLICY "view_own_body_compositions"
  ON body_compositions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athletes_view_group_body_compositions"
  ON body_compositions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
  );

CREATE POLICY "coaches_view_athletes_body_compositions"
  ON body_compositions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- POLITIQUES RECORDS
CREATE POLICY "view_own_records"
  ON records
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "athletes_view_group_records"
  ON records
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
  );

CREATE POLICY "coaches_view_athletes_records"
  ON records
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );