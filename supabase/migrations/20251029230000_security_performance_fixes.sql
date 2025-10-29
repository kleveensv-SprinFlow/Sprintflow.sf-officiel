/*
  # Security and Performance Fixes

  1. **Missing Indexes for Foreign Keys**
     - Add indexes for all foreign key columns to improve query performance
     - Covers: aliments_favoris, aliments_personnels, chat_messages, exercices_personnalises,
              group_chat_messages, group_members, groups, journal_alimentaire,
              recettes_personnelles, subscriptions

  2. **RLS Policy Optimization**
     - Replace `auth.uid()` with `(select auth.uid())` to avoid re-evaluation per row
     - Significantly improves query performance at scale

  3. **Function Search Path Security**
     - Fix search_path for all functions to prevent search_path hijacking attacks

  4. **Multiple Permissive Policies**
     - Consolidate overlapping policies into single efficient policies
*/

-- =====================================================
-- 1. CREATE MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

-- aliments_favoris
CREATE INDEX IF NOT EXISTS idx_aliments_favoris_athlete_id
  ON aliments_favoris(athlete_id);

-- aliments_personnels
CREATE INDEX IF NOT EXISTS idx_aliments_personnels_athlete_id
  ON aliments_personnels(athlete_id);

-- chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id
  ON chat_messages(user_id);

-- exercices_personnalises (already has idx_exercices_personnalises_athlete_id)
CREATE INDEX IF NOT EXISTS idx_exercices_personnalises_reference_id
  ON exercices_personnalises(exercice_reference_id);

-- group_chat_messages
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_user_id
  ON group_chat_messages(user_id);

-- group_members
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_id
  ON group_members(athlete_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id
  ON group_members(group_id);

-- groups
CREATE INDEX IF NOT EXISTS idx_groups_coach_id
  ON groups(coach_id);

-- journal_alimentaire
CREATE INDEX IF NOT EXISTS idx_journal_alimentaire_athlete_id
  ON journal_alimentaire(athlete_id);
CREATE INDEX IF NOT EXISTS idx_journal_alimentaire_athlete_date
  ON journal_alimentaire(athlete_id, date DESC);

-- recettes_personnelles
CREATE INDEX IF NOT EXISTS idx_recettes_personnelles_athlete_id
  ON recettes_personnelles(athlete_id);

-- subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON subscriptions(user_id);

-- objectifs_presets
CREATE INDEX IF NOT EXISTS idx_objectifs_presets_athlete_id
  ON objectifs_presets(athlete_id);

-- =====================================================
-- 2. FIX FUNCTION SEARCH PATHS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM public.groups WHERE invitation_code = code) INTO exists;
    IF NOT exists THEN EXIT; END IF;
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.invitation_code IS NULL THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$;

-- =====================================================
-- 3. OPTIMIZE RLS POLICIES - PROFILES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- 4. OPTIMIZE RLS POLICIES - GROUPS (CONSOLIDATE)
-- =====================================================

DROP POLICY IF EXISTS "Coaches can manage their groups" ON groups;
DROP POLICY IF EXISTS "Athletes can read groups they belong to" ON groups;

CREATE POLICY "Users can read their groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    coach_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = groups.id
      AND athlete_id = (select auth.uid())
    )
  );

CREATE POLICY "Coaches can manage their groups"
  ON groups FOR ALL
  TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

-- =====================================================
-- 5. OPTIMIZE RLS POLICIES - GROUP_MEMBERS (CONSOLIDATE)
-- =====================================================

DROP POLICY IF EXISTS "Coaches can manage their group members" ON group_members;
DROP POLICY IF EXISTS "Athletes can read their group memberships" ON group_members;

CREATE POLICY "Users can read group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    athlete_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_members.group_id
      AND coach_id = (select auth.uid())
    )
  );

CREATE POLICY "Coaches can manage group members"
  ON group_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_members.group_id
      AND coach_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_members.group_id
      AND coach_id = (select auth.uid())
    )
  );

-- =====================================================
-- 6. OPTIMIZE RLS POLICIES - SUBSCRIPTIONS
-- =====================================================

DROP POLICY IF EXISTS "Users can read own subscriptions" ON subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- 7. OPTIMIZE RLS POLICIES - CHAT_MESSAGES
-- =====================================================

DROP POLICY IF EXISTS "Users can read own chat messages" ON chat_messages;
CREATE POLICY "Users can read own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own chat messages" ON chat_messages;
CREATE POLICY "Users can insert own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- 8. OPTIMIZE RLS POLICIES - GROUP_CHAT_MESSAGES
-- =====================================================

DROP POLICY IF EXISTS "Group members can read group messages" ON group_chat_messages;
CREATE POLICY "Group members can read group messages"
  ON group_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_chat_messages.group_id
      AND g.coach_id = (select auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_chat_messages.group_id
      AND gm.athlete_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Group members can send messages" ON group_chat_messages;
CREATE POLICY "Group members can send messages"
  ON group_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid()) AND (
      EXISTS (
        SELECT 1 FROM public.groups g
        WHERE g.id = group_chat_messages.group_id
        AND g.coach_id = (select auth.uid())
      ) OR
      EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = group_chat_messages.group_id
        AND gm.athlete_id = (select auth.uid())
      )
    )
  );

-- =====================================================
-- 9. OPTIMIZE RLS POLICIES - NOTIFICATIONS (CONSOLIDATE)
-- =====================================================

DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Developer can manage all notifications" ON notifications;

CREATE POLICY "Users can manage notifications"
  ON notifications FOR ALL
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    (select auth.uid()) = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid
  )
  WITH CHECK (
    user_id = (select auth.uid()) OR
    (select auth.uid()) = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid
  );

-- =====================================================
-- 10. OPTIMIZE RLS POLICIES - PARTNERSHIPS (CONSOLIDATE)
-- =====================================================

DROP POLICY IF EXISTS "Allow authenticated users to view partnerships" ON partnerships;
DROP POLICY IF EXISTS "Allow developer to manage partnerships" ON partnerships;

CREATE POLICY "Users can view partnerships"
  ON partnerships FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Developer can manage partnerships"
  ON partnerships FOR ALL
  TO authenticated
  USING ((select auth.uid()) = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK ((select auth.uid()) = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

-- =====================================================
-- 11. OPTIMIZE RLS POLICIES - WORKOUTS
-- =====================================================

DROP POLICY IF EXISTS "workouts_full_access" ON workouts;
CREATE POLICY "workouts_full_access"
  ON workouts FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 12. OPTIMIZE RLS POLICIES - RECORDS
-- =====================================================

DROP POLICY IF EXISTS "records_full_access" ON records;
CREATE POLICY "records_full_access"
  ON records FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- 13. OPTIMIZE RLS POLICIES - EXERCICES_PERSONNALISES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own custom exercises" ON exercices_personnalises;
CREATE POLICY "Users can view own custom exercises"
  ON exercices_personnalises FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = athlete_id);

DROP POLICY IF EXISTS "Users can create own custom exercises" ON exercices_personnalises;
CREATE POLICY "Users can create own custom exercises"
  ON exercices_personnalises FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = athlete_id);

DROP POLICY IF EXISTS "Users can update own custom exercises" ON exercices_personnalises;
CREATE POLICY "Users can update own custom exercises"
  ON exercices_personnalises FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = athlete_id)
  WITH CHECK ((select auth.uid()) = athlete_id);

DROP POLICY IF EXISTS "Users can delete own custom exercises" ON exercices_personnalises;
CREATE POLICY "Users can delete own custom exercises"
  ON exercices_personnalises FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = athlete_id);

-- =====================================================
-- 14. OPTIMIZE RLS POLICIES - SESSION_TEMPLATES
-- =====================================================

DROP POLICY IF EXISTS "Coaches can manage their own session templates" ON session_templates;
CREATE POLICY "Coaches can manage their own session templates"
  ON session_templates FOR ALL
  TO authenticated
  USING (coach_id = (select auth.uid()))
  WITH CHECK (coach_id = (select auth.uid()));

-- =====================================================
-- 15. OPTIMIZE RLS POLICIES - DONNEES_CORPORELLES
-- =====================================================

DROP POLICY IF EXISTS "Athletes can manage own body data" ON donnees_corporelles;
CREATE POLICY "Athletes can manage own body data"
  ON donnees_corporelles FOR ALL
  TO authenticated
  USING ((select auth.uid()) = athlete_id)
  WITH CHECK ((select auth.uid()) = athlete_id);

-- =====================================================
-- 16. OPTIMIZE RLS POLICIES - OBJECTIFS_PRESETS
-- =====================================================

DROP POLICY IF EXISTS "Athletes can manage own objectifs" ON objectifs_presets;
CREATE POLICY "Athletes can manage own objectifs"
  ON objectifs_presets FOR ALL
  TO authenticated
  USING ((select auth.uid()) = athlete_id)
  WITH CHECK ((select auth.uid()) = athlete_id);

-- =====================================================
-- 17. OPTIMIZE RLS POLICIES - ALIMENTS_FAVORIS
-- =====================================================

DROP POLICY IF EXISTS "Athletes can manage own favorite foods" ON aliments_favoris;
CREATE POLICY "Athletes can manage own favorite foods"
  ON aliments_favoris FOR ALL
  TO authenticated
  USING ((select auth.uid()) = athlete_id)
  WITH CHECK ((select auth.uid()) = athlete_id);

-- =====================================================
-- 18. OPTIMIZE RLS POLICIES - ALIMENTS_PERSONNELS
-- =====================================================

DROP POLICY IF EXISTS "Athletes can manage own custom foods" ON aliments_personnels;
CREATE POLICY "Athletes can manage own custom foods"
  ON aliments_personnels FOR ALL
  TO authenticated
  USING ((select auth.uid()) = athlete_id)
  WITH CHECK ((select auth.uid()) = athlete_id);

-- =====================================================
-- 19. OPTIMIZE RLS POLICIES - RECETTES_PERSONNELLES
-- =====================================================

DROP POLICY IF EXISTS "Athletes can manage own recipes" ON recettes_personnelles;
CREATE POLICY "Athletes can manage own recipes"
  ON recettes_personnelles FOR ALL
  TO authenticated
  USING ((select auth.uid()) = athlete_id)
  WITH CHECK ((select auth.uid()) = athlete_id);

-- =====================================================
-- 20. OPTIMIZE RLS POLICIES - JOURNAL_ALIMENTAIRE
-- =====================================================

DROP POLICY IF EXISTS "Athletes can manage own food diary" ON journal_alimentaire;
CREATE POLICY "Athletes can manage own food diary"
  ON journal_alimentaire FOR ALL
  TO authenticated
  USING ((select auth.uid()) = athlete_id)
  WITH CHECK ((select auth.uid()) = athlete_id);

-- =====================================================
-- 21. OPTIMIZE RLS POLICIES - SLEEP_DATA
-- =====================================================

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sleep_data;
CREATE POLICY "Enable insert for authenticated users only"
  ON sleep_data FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON sleep_data;
CREATE POLICY "Enable read access for users based on user_id"
  ON sleep_data FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable update for users based on user_id" ON sleep_data;
CREATE POLICY "Enable update for users based on user_id"
  ON sleep_data FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON sleep_data;
CREATE POLICY "Enable delete for users based on user_id"
  ON sleep_data FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- 22. ANALYZE TABLES FOR QUERY OPTIMIZATION
-- =====================================================

ANALYZE profiles;
ANALYZE groups;
ANALYZE group_members;
ANALYZE workouts;
ANALYZE records;
ANALYZE notifications;
ANALYZE aliments_favoris;
ANALYZE aliments_personnels;
ANALYZE journal_alimentaire;
ANALYZE recettes_personnelles;
ANALYZE donnees_corporelles;
ANALYZE sleep_data;
