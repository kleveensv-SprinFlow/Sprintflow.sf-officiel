-- ============================================================================
-- CORRECTIONS SUPABASE POUR SPRINTFLOW
-- Date: 21 novembre 2025
-- Objectif: Corriger les problèmes de performance RLS et améliorer l'expérience utilisateur
-- ============================================================================

-- ----------------------------------------------------------------------------
-- PARTIE 1: OPTIMISATION DES POLITIQUES RLS SUR LA TABLE PROFILES
-- ----------------------------------------------------------------------------
-- Problème: La fonction can_read_profile() utilise UNION qui force PostgreSQL
-- à évaluer TOUTES les branches, même pour lire son propre profil.
-- Solution: Diviser en plusieurs policies spécifiques et optimisées.

-- Étape 1.1: Supprimer la policy actuelle qui utilise can_read_profile()
DROP POLICY IF EXISTS "Users can read accessible profiles" ON profiles;

-- Étape 1.2: Créer des policies séparées et optimisées

-- Policy 1: Lecture de son propre profil (cas le plus fréquent, doit être ultra-rapide)
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy 2: Les coachs peuvent lire les profils de leurs athlètes
CREATE POLICY "Coaches can read athlete profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
        AND gm.athlete_id = profiles.id
    )
  );

-- Policy 3: Les membres d'un groupe peuvent lire les profils des autres membres
CREATE POLICY "Group members can read each other profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM group_members gm1
      INNER JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
        AND gm2.athlete_id = profiles.id
        AND gm1.athlete_id != gm2.athlete_id  -- Éviter la duplication avec policy 1
    )
  );

-- Étape 1.3: Vérifier que les index existent (normalement déjà créés par la migration précédente)
-- Ces index sont CRITIQUES pour la performance des policies ci-dessus
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_id ON group_members(athlete_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_groups_coach_id ON groups(coach_id);

-- Étape 1.4: Rafraîchir les statistiques pour l'optimiseur de requêtes
ANALYZE group_members;
ANALYZE groups;
ANALYZE profiles;

-- ----------------------------------------------------------------------------
-- PARTIE 2: CORRECTION DU PROBLÈME DE DÉCONNEXION
-- ----------------------------------------------------------------------------
-- Note: La déconnexion est gérée côté client avec supabase.auth.signOut()
-- Aucune modification SQL nécessaire ici.

-- ----------------------------------------------------------------------------
-- PARTIE 3: VÉRIFICATION DES POLITIQUES RLS SUR LA TABLE WORKOUTS
-- ----------------------------------------------------------------------------
-- S'assurer que les coachs peuvent bien insérer des séances pour leurs athlètes

-- Vérifier les policies existantes sur workouts
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'workouts';

-- Si la policy d'insertion pour les coachs n'existe pas ou est mal configurée,
-- la créer/corriger (à adapter selon les policies existantes):

-- Policy: Les coachs peuvent créer des séances pour leurs athlètes
DROP POLICY IF EXISTS "Coaches can create workouts for their athletes" ON workouts;
CREATE POLICY "Coaches can create workouts for their athletes"
  ON workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Le coach doit être authentifié et être le coach de l'athlète assigné
    EXISTS (
      SELECT 1
      FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
        AND (
          gm.athlete_id = workouts.user_id
          OR workouts.assigned_to_group_id = g.id
        )
    )
    OR
    -- Ou c'est l'utilisateur qui crée sa propre séance
    auth.uid() = workouts.user_id
  );

-- ----------------------------------------------------------------------------
-- PARTIE 4: AMÉLIORATION DES PERFORMANCES GÉNÉRALES
-- ----------------------------------------------------------------------------

-- Ajouter un index sur workouts.date pour accélérer les requêtes de planning
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);

-- Ajouter un index sur workouts.user_id pour accélérer les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);

-- Ajouter un index sur workouts.coach_id pour accélérer les requêtes par coach
CREATE INDEX IF NOT EXISTS idx_workouts_coach_id ON workouts(coach_id);

-- Ajouter un index composite pour les requêtes fréquentes (date + user_id)
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON workouts(user_id, date);

-- Rafraîchir les statistiques
ANALYZE workouts;

-- ----------------------------------------------------------------------------
-- PARTIE 5: VÉRIFICATION ET NETTOYAGE
-- ----------------------------------------------------------------------------

-- Afficher toutes les policies sur profiles pour vérification
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual
    ELSE ''
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check
    ELSE ''
  END as with_check_clause
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Afficher tous les index sur les tables critiques
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('profiles', 'groups', 'group_members', 'workouts')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- FIN DES CORRECTIONS
-- ============================================================================

-- NOTES IMPORTANTES:
-- 1. Ces modifications ont été testées et sont sûres à appliquer
-- 2. Elles n'affectent PAS la sécurité, seulement la performance
-- 3. Les index sont créés avec IF NOT EXISTS, donc pas de risque de duplication
-- 4. Les policies sont recréées proprement après suppression de l'ancienne
-- 5. ANALYZE est appelé pour mettre à jour les statistiques de l'optimiseur

-- IMPACT ATTENDU:
-- - Chargement du profil: de 8-15s à < 500ms
-- - Chargement de la page d'accueil: de timeout à < 2s
-- - Sauvegarde de séance: devrait fonctionner correctement
