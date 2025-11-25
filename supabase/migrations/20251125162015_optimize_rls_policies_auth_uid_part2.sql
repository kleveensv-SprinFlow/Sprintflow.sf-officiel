/*
  # Optimisation des politiques RLS - Partie 2

  ## Description
  Suite de l'optimisation des politiques RLS avec (select auth.uid())
  
  ## Tables optimisées
  - groups
  - group_members
  - workout_templates
  - exercices_personnalises
  - objectifs
  - profiles
  - wellness_log
*/

-- ============================================================================
-- TABLE: groups
-- ============================================================================

DROP POLICY IF EXISTS "Coaches manage own groups" ON groups;
CREATE POLICY "Coaches manage own groups"
  ON groups FOR ALL
  TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow coach to read their own groups" ON groups;
CREATE POLICY "Allow coach to read their own groups"
  ON groups FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()));

-- ============================================================================
-- TABLE: group_members
-- ============================================================================

DROP POLICY IF EXISTS "Coaches can view their group members" ON group_members;
CREATE POLICY "Coaches can view their group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.coach_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Athletes can view own membership" ON group_members;
CREATE POLICY "Athletes can view own membership"
  ON group_members FOR SELECT
  TO authenticated
  USING (athlete_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can add members" ON group_members;
CREATE POLICY "Coaches can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.coach_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can update members" ON group_members;
CREATE POLICY "Coaches can update members"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.coach_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Coaches can remove members" ON group_members;
CREATE POLICY "Coaches can remove members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_members.group_id 
      AND g.coach_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TABLE: workout_templates
-- ============================================================================

DROP POLICY IF EXISTS "Les coachs peuvent créer des modèles" ON workout_templates;
CREATE POLICY "Les coachs peuvent créer des modèles"
  ON workout_templates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Les coachs peuvent voir leurs propres modèles" ON workout_templates;
CREATE POLICY "Les coachs peuvent voir leurs propres modèles"
  ON workout_templates FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Les coachs peuvent modifier leurs propres modèles" ON workout_templates;
CREATE POLICY "Les coachs peuvent modifier leurs propres modèles"
  ON workout_templates FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Les coachs peuvent supprimer leurs propres modèles" ON workout_templates;
CREATE POLICY "Les coachs peuvent supprimer leurs propres modèles"
  ON workout_templates FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- TABLE: exercices_personnalises
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can create exercises" ON exercices_personnalises;
CREATE POLICY "Authenticated users can create exercises"
  ON exercices_personnalises FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own exercises" ON exercices_personnalises;
CREATE POLICY "Users can manage their own exercises"
  ON exercices_personnalises FOR ALL
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view exercises from linked users" ON exercices_personnalises;
CREATE POLICY "Users can view exercises from linked users"
  ON exercices_personnalises FOR SELECT
  TO authenticated
  USING (
    creator_id IN (
      SELECT coach_id FROM coach_athlete_links 
      WHERE athlete_id = (select auth.uid()) AND status = 'accepted'
      UNION
      SELECT athlete_id FROM coach_athlete_links 
      WHERE coach_id = (select auth.uid()) AND status = 'accepted'
    )
  );

-- ============================================================================
-- TABLE: objectifs
-- ============================================================================

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre objectif" ON objectifs;
CREATE POLICY "Les utilisateurs peuvent voir leur propre objectif"
  ON objectifs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leur propre objectif" ON objectifs;
CREATE POLICY "Les utilisateurs peuvent insérer leur propre objectif"
  ON objectifs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leur propre objectif" ON objectifs;
CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre objectif"
  ON objectifs FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leur propre objectif" ON objectifs;
CREATE POLICY "Les utilisateurs peuvent supprimer leur propre objectif"
  ON objectifs FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- TABLE: profiles
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can read athlete profiles" ON profiles;
CREATE POLICY "Coaches can read athlete profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(id));

-- ============================================================================
-- TABLE: wellness_log
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own wellness logs" ON wellness_log;
CREATE POLICY "Users can manage their own wellness logs"
  ON wellness_log FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own wellness logs" ON wellness_log;
CREATE POLICY "Users can view their own wellness logs"
  ON wellness_log FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own wellness logs" ON wellness_log;
CREATE POLICY "Users can insert their own wellness logs"
  ON wellness_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own wellness logs" ON wellness_log;
CREATE POLICY "Users can update their own wellness logs"
  ON wellness_log FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can read wellness logs of their athletes" ON wellness_log;
CREATE POLICY "Coaches can read wellness logs of their athletes"
  ON wellness_log FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(user_id));

DROP POLICY IF EXISTS "Coaches can view their athletes' wellness logs" ON wellness_log;
CREATE POLICY "Coaches can view their athletes' wellness logs"
  ON wellness_log FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(user_id));

DROP POLICY IF EXISTS "Coaches can view wellness logs of group members" ON wellness_log;
CREATE POLICY "Coaches can view wellness logs of group members"
  ON wellness_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      WHERE gm.athlete_id = wellness_log.user_id
      AND g.coach_id = (select auth.uid())
    )
  );
