/*
  # Optimisation des politiques RLS - Partie 3

  ## Description
  Dernière partie de l'optimisation des politiques RLS
  
  ## Tables optimisées
  - conversations
  - messages
  - coach_athlete_links
  - block_templates
  - group_join_requests
  - sprinty_messages
  - donnees_corporelles
  - video_analysis_logs
  - push_subscriptions
*/

-- ============================================================================
-- TABLE: conversations
-- ============================================================================

DROP POLICY IF EXISTS "Allow user to see their own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow SELECT on own conversations" ON conversations;
DROP POLICY IF EXISTS "Enable read access for user's own conversations" ON conversations;
CREATE POLICY "Allow user to see their own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow user to create their own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow INSERT on own conversations" ON conversations;
CREATE POLICY "Allow user to create their own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow user to update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow UPDATE on own conversations" ON conversations;
DROP POLICY IF EXISTS "Enable update access for user's own conversations" ON conversations;
CREATE POLICY "Allow user to update their own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow user to delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Allow DELETE on own conversations" ON conversations;
CREATE POLICY "Allow user to delete their own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================================================
-- TABLE: messages
-- ============================================================================

DROP POLICY IF EXISTS "Allow user to see messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow SELECT on messages in own conversations" ON messages;
CREATE POLICY "Allow user to see messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND c.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Allow user to insert messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Allow INSERT on messages in own conversations" ON messages;
CREATE POLICY "Allow user to insert messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = messages.conversation_id 
      AND c.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TABLE: coach_athlete_links
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own links" ON coach_athlete_links;
CREATE POLICY "Users can view their own links"
  ON coach_athlete_links FOR SELECT
  TO authenticated
  USING (coach_id = (select auth.uid()) OR athlete_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can create links" ON coach_athlete_links;
CREATE POLICY "Coaches can create links"
  ON coach_athlete_links FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = (select auth.uid()));

DROP POLICY IF EXISTS "Athletes can update link status" ON coach_athlete_links;
CREATE POLICY "Athletes can update link status"
  ON coach_athlete_links FOR UPDATE
  TO authenticated
  USING (athlete_id = (select auth.uid()));

-- ============================================================================
-- TABLE: block_templates
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own block templates" ON block_templates;
CREATE POLICY "Users can manage their own block templates"
  ON block_templates FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- TABLE: group_join_requests
-- ============================================================================

DROP POLICY IF EXISTS "Allow coach to read requests for their groups" ON group_join_requests;
CREATE POLICY "Allow coach to read requests for their groups"
  ON group_join_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_join_requests.group_id 
      AND g.coach_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Allow athlete to read their own requests" ON group_join_requests;
CREATE POLICY "Allow athlete to read their own requests"
  ON group_join_requests FOR SELECT
  TO authenticated
  USING (athlete_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow athlete to create a join request" ON group_join_requests;
CREATE POLICY "Allow athlete to create a join request"
  ON group_join_requests FOR INSERT
  TO authenticated
  WITH CHECK (athlete_id = (select auth.uid()));

DROP POLICY IF EXISTS "Allow coach to update request status for their groups" ON group_join_requests;
CREATE POLICY "Allow coach to update request status for their groups"
  ON group_join_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g 
      WHERE g.id = group_join_requests.group_id 
      AND g.coach_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TABLE: sprinty_messages
-- ============================================================================

DROP POLICY IF EXISTS "Users can view messages from their conversations" ON sprinty_messages;
CREATE POLICY "Users can view messages from their conversations"
  ON sprinty_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sprinty_conversations sc 
      WHERE sc.id = sprinty_messages.conversation_id 
      AND sc.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert messages into their conversations" ON sprinty_messages;
CREATE POLICY "Users can insert messages into their conversations"
  ON sprinty_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sprinty_conversations sc 
      WHERE sc.id = sprinty_messages.conversation_id 
      AND sc.user_id = (select auth.uid())
    )
  );

-- ============================================================================
-- TABLE: donnees_corporelles
-- ============================================================================

DROP POLICY IF EXISTS "Athletes can manage their own body data" ON donnees_corporelles;
CREATE POLICY "Athletes can manage their own body data"
  ON donnees_corporelles FOR ALL
  TO authenticated
  USING (athlete_id = (select auth.uid()))
  WITH CHECK (athlete_id = (select auth.uid()));

-- ============================================================================
-- TABLE: video_analysis_logs
-- ============================================================================

DROP POLICY IF EXISTS "Athletes can manage their own analysis logs" ON video_analysis_logs;
CREATE POLICY "Athletes can manage their own analysis logs"
  ON video_analysis_logs FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Coaches can view shared analysis logs of their athletes" ON video_analysis_logs;
DROP POLICY IF EXISTS "Coaches can view their athletes analysis logs" ON video_analysis_logs;
CREATE POLICY "Coaches can view their athletes analysis logs"
  ON video_analysis_logs FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(user_id));

-- ============================================================================
-- TABLE: push_subscriptions
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to manage their own push subscriptions" ON push_subscriptions;
CREATE POLICY "Allow users to manage their own push subscriptions"
  ON push_subscriptions FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
