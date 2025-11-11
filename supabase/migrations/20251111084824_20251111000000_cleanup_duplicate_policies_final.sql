/*
  # Nettoyage final des policies en double

  ## Problème identifié
  - 13 policies sur workouts (au lieu de 4)
  - 4 policies SELECT en double qui se contredisent
  - 3 policies INSERT en double
  - 6 policies UPDATE en double
  - Chaque requête doit évaluer TOUTES les policies = LENTEUR

  ## Solution
  1. Supprimer TOUTES les policies existantes sur workouts
  2. Créer 4 policies simples et claires (1 par opération)
  3. Utiliser des helper functions pour la clarté

  ## Résultat attendu
  - 1 policy SELECT simple
  - 1 policy INSERT simple
  - 1 policy UPDATE simple
  - 1 policy DELETE simple
  - Temps de requête divisé par 3
*/

-- ============================================
-- ÉTAPE 1: Supprimer TOUTES les policies workouts
-- ============================================

DROP POLICY IF EXISTS "Allow athlete and coach access to workouts" ON workouts;
DROP POLICY IF EXISTS "Athletes can view assigned workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can view their athletes workouts" ON workouts;
DROP POLICY IF EXISTS "Workouts select access" ON workouts;
DROP POLICY IF EXISTS "Allow authenticated users to create workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can create planned workouts" ON workouts;
DROP POLICY IF EXISTS "Workouts insert access" ON workouts;
DROP POLICY IF EXISTS "Allow coaches to update their athletes' workouts" ON workouts;
DROP POLICY IF EXISTS "Allow users to update their own workouts" ON workouts;
DROP POLICY IF EXISTS "Athletes can update planned workouts" ON workouts;
DROP POLICY IF EXISTS "Coaches can validate completed workouts" ON workouts;
DROP POLICY IF EXISTS "Workouts update access" ON workouts;
DROP POLICY IF EXISTS "Workouts delete access" ON workouts;

-- ============================================
-- ÉTAPE 2: Créer des helper functions optimisées
-- ============================================

-- Fonction pour vérifier si on peut lire un workout
CREATE OR REPLACE FUNCTION can_read_workout(workout_user_id uuid, workout_coach_id uuid, workout_assigned_to_user_id uuid, workout_assigned_to_group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    -- C'est son propre workout
    workout_user_id = auth.uid()
    OR
    -- C'est un workout créé par moi en tant que coach
    workout_coach_id = auth.uid()
    OR
    -- Le workout m'est assigné directement
    workout_assigned_to_user_id = auth.uid()
    OR
    -- Le workout est assigné à un de mes groupes
    EXISTS (
      SELECT 1
      FROM group_members gm
      WHERE gm.group_id = workout_assigned_to_group_id
        AND gm.athlete_id = auth.uid()
    )
    OR
    -- Je suis coach de l'athlète
    EXISTS (
      SELECT 1
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
        AND gm.athlete_id = workout_user_id
    )
  );
$$;

-- ============================================
-- ÉTAPE 3: Créer 4 policies simples et efficaces
-- ============================================

-- Policy SELECT: Utilise la fonction helper
CREATE POLICY "Users can read accessible workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (
    can_read_workout(user_id, coach_id, assigned_to_user_id, assigned_to_group_id)
  );

-- Policy INSERT: Un utilisateur peut créer des workouts pour lui-même
-- Un coach peut créer des workouts planifiés pour ses athlètes
CREATE POLICY "Users can create workouts"
  ON workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Créer pour soi-même
    user_id = auth.uid()
    OR
    -- Coach créant un workout planifié
    (
      coach_id = auth.uid()
      AND status = 'planned'
      AND EXISTS (
        SELECT 1
        FROM groups g
        INNER JOIN group_members gm ON g.id = gm.group_id
        WHERE g.coach_id = auth.uid()
          AND gm.athlete_id = user_id
      )
    )
  );

-- Policy UPDATE: Propriétaire ou coach peut modifier
CREATE POLICY "Users can update workouts"
  ON workouts
  FOR UPDATE
  TO authenticated
  USING (
    -- C'est mon workout
    user_id = auth.uid()
    OR
    -- Je suis coach de l'athlète
    EXISTS (
      SELECT 1
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
        AND gm.athlete_id = user_id
    )
  )
  WITH CHECK (
    -- Même condition pour la vérification
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
        AND gm.athlete_id = user_id
    )
  );

-- Policy DELETE: Seulement le propriétaire
CREATE POLICY "Users can delete own workouts"
  ON workouts
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- ÉTAPE 4: Créer des index pour optimiser les nouvelles policies
-- ============================================

-- Index pour les workouts par coach
CREATE INDEX IF NOT EXISTS idx_workouts_coach_id ON workouts(coach_id) WHERE coach_id IS NOT NULL;

-- Index pour les workouts assignés à un utilisateur
CREATE INDEX IF NOT EXISTS idx_workouts_assigned_to_user ON workouts(assigned_to_user_id) WHERE assigned_to_user_id IS NOT NULL;

-- Index pour les workouts assignés à un groupe
CREATE INDEX IF NOT EXISTS idx_workouts_assigned_to_group ON workouts(assigned_to_group_id) WHERE assigned_to_group_id IS NOT NULL;

-- Index composite pour les requêtes de coach
CREATE INDEX IF NOT EXISTS idx_workouts_user_status ON workouts(user_id, status);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Compter les policies finales (devrait être 4)
SELECT 
  'WORKOUTS POLICIES' as table_name,
  cmd,
  count(*) as count
FROM pg_policies
WHERE tablename = 'workouts'
GROUP BY cmd
ORDER BY cmd;
