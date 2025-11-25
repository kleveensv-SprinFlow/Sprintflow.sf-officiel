/*
  # Nettoyage des politiques RLS en double

  ## Description
  Cette migration supprime les politiques RLS en double pour éviter les conflits
  et améliorer les performances.
  
  ## Changements
  Suppression des doublons de politiques pour:
  - records (garder les politiques optimisées)
  - wellness_log
  - workout_templates  
  - profiles
  - individual_chat_messages
  - message_read_status
  - exercices_personnalises
  - objectifs
  - workouts
  - conversations
  - messages

  ## Impact
  - Élimination des conflits de politiques
  - Simplification de la gestion RLS
  - Amélioration des performances
*/

-- ============================================================================
-- TABLE: records - Supprimer les anciennes politiques redondantes
-- ============================================================================

DROP POLICY IF EXISTS "Allow athlete and coach access to records" ON records;
DROP POLICY IF EXISTS "Coaches can read records of their athletes" ON records;
DROP POLICY IF EXISTS records_select_access ON records;
DROP POLICY IF EXISTS records_insert_access ON records;
DROP POLICY IF EXISTS records_update_access ON records;
DROP POLICY IF EXISTS records_delete_access ON records;

-- ============================================================================
-- TABLE: wellness_log - Garder seulement les politiques optimisées
-- ============================================================================

DROP POLICY IF EXISTS "Wellness logs select access" ON wellness_log;
DROP POLICY IF EXISTS "Wellness logs insert access" ON wellness_log;
DROP POLICY IF EXISTS "Wellness logs update access" ON wellness_log;
DROP POLICY IF EXISTS "Wellness logs delete access" ON wellness_log;

-- ============================================================================
-- TABLE: workout_templates - Garder seulement "Users can manage their own templates"
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own templates" ON workout_templates;

-- Recréer une politique unique ALL
CREATE POLICY "Users can manage their own templates"
  ON workout_templates FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- TABLE: profiles - Garder les politiques essentielles
-- ============================================================================

DROP POLICY IF EXISTS "Users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Group members can read each other profiles" ON profiles;
DROP POLICY IF EXISTS "Users delete own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;

-- ============================================================================
-- TABLE: individual_chat_messages - Garder les politiques françaises
-- ============================================================================

DROP POLICY IF EXISTS "Users can exchange private messages" ON individual_chat_messages;

-- ============================================================================
-- TABLE: message_read_status - Garder la politique française
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage their own read status" ON message_read_status;

-- ============================================================================
-- TABLE: exercices_personnalises - Nettoyer les doublons
-- ============================================================================

DROP POLICY IF EXISTS "Users can delete own custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can create own custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can view own custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can update own custom exercises" ON exercices_personnalises;

-- ============================================================================
-- TABLE: objectifs - Garder les politiques françaises
-- ============================================================================

DROP POLICY IF EXISTS "Les coachs peuvent voir les objectifs de leurs athlètes" ON objectifs;

-- ============================================================================
-- TABLE: workouts - Nettoyer les doublons
-- ============================================================================

DROP POLICY IF EXISTS "Coaches can read workouts of their athletes" ON workouts;
DROP POLICY IF EXISTS "Coaches can create workouts for their athletes" ON workouts;

-- Recréer les politiques coach optimisées
CREATE POLICY "Coaches can read workouts of their athletes"
  ON workouts FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(user_id));

CREATE POLICY "Coaches can create workouts for their athletes"
  ON workouts FOR INSERT
  TO authenticated
  WITH CHECK (is_coach_of_athlete(user_id));

-- ============================================================================
-- TABLE: groups - Nettoyer les doublons
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can read groups by invitation code" ON groups;
DROP POLICY IF EXISTS "Athletes view their groups" ON groups;

-- ============================================================================
-- TABLE: partnerships - Nettoyer les doublons
-- ============================================================================

DROP POLICY IF EXISTS "Developer can manage partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can view partnerships" ON partnerships;

-- Recréer une politique simple pour lire les partnerships
CREATE POLICY "Users can view partnerships"
  ON partnerships FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- TABLE: coach_athlete_links - Nettoyer les doublons
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can read links by invite code" ON coach_athlete_links;

-- ============================================================================
-- TABLE: donnees_corporelles - Nettoyer les doublons
-- ============================================================================

DROP POLICY IF EXISTS "Coaches can view their athletes body data" ON donnees_corporelles;

-- Recréer la politique coach optimisée
CREATE POLICY "Coaches can view their athletes body data"
  ON donnees_corporelles FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(athlete_id));
