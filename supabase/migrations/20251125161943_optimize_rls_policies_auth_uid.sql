/*
  # Optimisation des politiques RLS - auth.uid()

  ## Description
  Cette migration optimise les politiques RLS en remplaçant auth.uid() par (select auth.uid())
  pour éviter la réévaluation à chaque ligne.
  
  ## Changements
  Optimisation des politiques pour les tables critiques:
  - records
  - injury_logs
  - individual_chat_messages
  - message_read_status
  - workouts
  - custom_workout_types
  - sprinty_conversations
  - conversations

  ## Impact
  - Amélioration significative des performances des requêtes avec RLS
  - Réduction de la charge CPU sur la base de données
*/

-- ============================================================================
-- TABLE: records
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own records" ON records;
CREATE POLICY "Users can view own records"
  ON records FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can view athlete records" ON records;
CREATE POLICY "Coaches can view athlete records"
  ON records FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(user_id));

DROP POLICY IF EXISTS "Users can insert own records" ON records;
CREATE POLICY "Users can insert own records"
  ON records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own records" ON records;
CREATE POLICY "Users can update own records"
  ON records FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own records" ON records;
CREATE POLICY "Users can delete own records"
  ON records FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- TABLE: injury_logs
-- ============================================================================

DROP POLICY IF EXISTS "Users can insert their own injury logs" ON injury_logs;
CREATE POLICY "Users can insert their own injury logs"
  ON injury_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can read their own injury logs" ON injury_logs;
CREATE POLICY "Users can read their own injury logs"
  ON injury_logs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can read injury logs of their athletes" ON injury_logs;
CREATE POLICY "Coaches can read injury logs of their athletes"
  ON injury_logs FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(user_id));

-- ============================================================================
-- TABLE: individual_chat_messages
-- ============================================================================

DROP POLICY IF EXISTS "Les utilisateurs peuvent échanger des messages privés" ON individual_chat_messages;
CREATE POLICY "Les utilisateurs peuvent échanger des messages privés"
  ON individual_chat_messages FOR SELECT
  TO authenticated
  USING (sender_id = (select auth.uid()) OR receiver_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can send messages" ON individual_chat_messages;
CREATE POLICY "Users can send messages"
  ON individual_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (select auth.uid()));

-- ============================================================================
-- TABLE: message_read_status
-- ============================================================================

DROP POLICY IF EXISTS "Les utilisateurs peuvent gérer leur propre statut de lecture" ON message_read_status;
CREATE POLICY "Les utilisateurs peuvent gérer leur propre statut de lecture"
  ON message_read_status FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- TABLE: workouts
-- ============================================================================

DROP POLICY IF EXISTS "Users read own workouts" ON workouts;
CREATE POLICY "Users read own workouts"
  ON workouts FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create workouts" ON workouts;
CREATE POLICY "Users can create workouts"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update workouts" ON workouts;
CREATE POLICY "Users can update workouts"
  ON workouts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own workouts" ON workouts;
CREATE POLICY "Users can delete own workouts"
  ON workouts FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can insert workouts for their athletes" ON workouts;
CREATE POLICY "Coaches can insert workouts for their athletes"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (is_coach_of_athlete(user_id));

-- ============================================================================
-- TABLE: custom_workout_types
-- ============================================================================

DROP POLICY IF EXISTS "Enable read access for own custom workout types" ON custom_workout_types;
CREATE POLICY "Enable read access for own custom workout types"
  ON custom_workout_types FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Enable insert for own custom workout types" ON custom_workout_types;
CREATE POLICY "Enable insert for own custom workout types"
  ON custom_workout_types FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Enable update for own custom workout types" ON custom_workout_types;
CREATE POLICY "Enable update for own custom workout types"
  ON custom_workout_types FOR UPDATE
  TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Enable delete for own custom workout types" ON custom_workout_types;
CREATE POLICY "Enable delete for own custom workout types"
  ON custom_workout_types FOR DELETE
  TO authenticated
  USING (coach_id = (select auth.uid()));

-- ============================================================================
-- TABLE: sprinty_conversations
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own conversations" ON sprinty_conversations;
CREATE POLICY "Users can view their own conversations"
  ON sprinty_conversations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own conversations" ON sprinty_conversations;
CREATE POLICY "Users can insert their own conversations"
  ON sprinty_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own conversations" ON sprinty_conversations;
CREATE POLICY "Users can update their own conversations"
  ON sprinty_conversations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own conversations" ON sprinty_conversations;
CREATE POLICY "Users can delete their own conversations"
  ON sprinty_conversations FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
