-- ============================================
-- SCRIPT DE DIAGNOSTIC COMPLET
-- RLS, Index, Performances et Sécurité
-- ============================================

-- Ce script permet de vérifier que toutes les optimisations
-- ont été correctement appliquées

-- ============================================
-- SECTION 1: VÉRIFICATION DES POLICIES RLS
-- ============================================

\echo '======================================'
\echo '1. POLICIES SELECT SUR PROFILES'
\echo '======================================'

-- Devrait retourner EXACTEMENT 2 policies SELECT
SELECT
  policyname as "Nom de la Policy",
  cmd as "Commande",
  substring(qual::text from 1 for 80) as "Condition (80 premiers caractères)"
FROM pg_policies
WHERE tablename = 'profiles'
  AND cmd = 'SELECT'
  AND schemaname = 'public'
ORDER BY policyname;

\echo ''
\echo '✅ ATTENDU: 2 policies SELECT'
\echo '   1. "Users read own profile FAST" avec condition: (id = auth.uid())'
\echo '   2. "Users read accessible profiles via groups" avec condition: ((id <> auth.uid()) AND can_read_profile(id))'
\echo ''

-- ============================================
-- SECTION 2: VÉRIFICATION DES POLICIES SUR GROUP_MEMBERS
-- ============================================

\echo '======================================'
\echo '2. POLICIES SUR GROUP_MEMBERS'
\echo '======================================'

SELECT
  policyname as "Nom de la Policy",
  cmd as "Commande",
  substring(qual::text from 1 for 60) as "Condition"
FROM pg_policies
WHERE tablename = 'group_members'
  AND schemaname = 'public'
ORDER BY cmd, policyname;

\echo ''
\echo '✅ ATTENDU: Policies autorisant athlete_id = auth.uid() et coachs'
\echo ''

-- ============================================
-- SECTION 3: VÉRIFICATION DE LA FONCTION can_read_profile
-- ============================================

\echo '======================================'
\echo '3. FONCTION can_read_profile'
\echo '======================================'

SELECT
  proname as "Nom de la fonction",
  provolatile as "Volatilité",
  CASE
    WHEN prosrc LIKE '%OR%' THEN '✅ Utilise OR (optimisé)'
    WHEN prosrc LIKE '%UNION%' THEN '⚠️ Utilise UNION (non optimisé)'
    ELSE '❌ Structure inconnue'
  END as "Structure"
FROM pg_proc
WHERE proname = 'can_read_profile'
  AND pronamespace = 'public'::regnamespace;

\echo ''
\echo '✅ ATTENDU: Volatilité = "s" (STABLE) et Structure avec OR'
\echo ''

-- ============================================
-- SECTION 4: VÉRIFICATION DES INDEX
-- ============================================

\echo '======================================'
\echo '4. INDEX SUR LES TABLES CRITIQUES'
\echo '======================================'

SELECT
  tablename as "Table",
  indexname as "Nom de l'index",
  CASE
    WHEN indexname LIKE '%pkey%' THEN 'PRIMARY KEY'
    WHEN indexname LIKE 'idx_%' THEN 'INDEX PERFORMANCE'
    ELSE 'AUTRE'
  END as "Type"
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'group_members', 'groups', 'coach_athlete_links')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

\echo ''
\echo '✅ ATTENDU: Au moins 6 index de performance sur ces tables'
\echo '   - idx_group_members_athlete_id'
\echo '   - idx_group_members_group_id'
\echo '   - idx_group_members_athlete_group'
\echo '   - idx_groups_coach_id'
\echo '   - idx_coach_athlete_links_coach'
\echo '   - idx_coach_athlete_links_athlete'
\echo ''

-- ============================================
-- SECTION 5: TEST DE PERFORMANCE
-- ============================================

\echo '======================================'
\echo '5. TEST DE PERFORMANCE (EXPLAIN)'
\echo '======================================'

\echo 'IMPORTANT: Remplacez USER_ID_HERE par un vrai ID utilisateur avant d\'exécuter'
\echo ''

-- Décommentez et remplacez l'ID pour tester :
-- EXPLAIN ANALYZE
-- SELECT id, first_name, last_name, role, photo_url
-- FROM profiles
-- WHERE id = 'USER_ID_HERE';

\echo ''
\echo '✅ ATTENDU: Temps d\'exécution < 100ms'
\echo '✅ ATTENDU: "Index Scan" visible dans le plan d\'exécution'
\echo ''

-- ============================================
-- SECTION 6: STATISTIQUES DES TABLES
-- ============================================

\echo '======================================'
\echo '6. STATISTIQUES DES TABLES'
\echo '======================================'

SELECT
  schemaname as "Schema",
  tablename as "Table",
  n_live_tup as "Nombre de lignes",
  n_dead_tup as "Lignes mortes",
  last_analyze as "Dernière analyse"
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'group_members', 'groups', 'coach_athlete_links')
ORDER BY tablename;

\echo ''
\echo '✅ ATTENDU: last_analyze récent (< 1 heure)'
\echo ''

-- ============================================
-- SECTION 7: RÉSUMÉ FINAL
-- ============================================

\echo '======================================'
\echo '7. RÉSUMÉ FINAL'
\echo '======================================'

DO $$
DECLARE
  policy_count integer;
  index_count integer;
  function_exists boolean;
BEGIN
  -- Compter les policies SELECT sur profiles
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'profiles'
    AND cmd = 'SELECT'
    AND schemaname = 'public';

  -- Compter les index de performance
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('group_members', 'groups', 'coach_athlete_links')
    AND indexname LIKE 'idx_%';

  -- Vérifier l'existence de la fonction
  SELECT EXISTS (
    SELECT 1 FROM pg_proc
    WHERE proname = 'can_read_profile'
      AND pronamespace = 'public'::regnamespace
  ) INTO function_exists;

  -- Afficher le résumé
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'RÉSUMÉ DES VÉRIFICATIONS';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';

  IF policy_count = 2 THEN
    RAISE NOTICE '✅ Policies SELECT sur profiles: % (OK)', policy_count;
  ELSE
    RAISE WARNING '⚠️ Policies SELECT sur profiles: % (attendu: 2)', policy_count;
  END IF;

  IF index_count >= 6 THEN
    RAISE NOTICE '✅ Index de performance: % (OK)', index_count;
  ELSE
    RAISE WARNING '⚠️ Index de performance: % (attendu: >= 6)', index_count;
  END IF;

  IF function_exists THEN
    RAISE NOTICE '✅ Fonction can_read_profile existe';
  ELSE
    RAISE WARNING '⚠️ Fonction can_read_profile manquante';
  END IF;

  RAISE NOTICE '';

  IF policy_count = 2 AND index_count >= 6 AND function_exists THEN
    RAISE NOTICE '🎉 SUCCÈS: Toutes les optimisations sont en place!';
    RAISE NOTICE '';
    RAISE NOTICE 'Performances attendues:';
    RAISE NOTICE '  - Chargement profil: < 300ms';
    RAISE NOTICE '  - Requête group_members: < 200ms';
    RAISE NOTICE '  - Chargement groupes: < 500ms';
    RAISE NOTICE '  - Temps total connexion → dashboard: < 3s';
  ELSE
    RAISE NOTICE '⚠️ ATTENTION: Certaines optimisations manquent';
    RAISE NOTICE 'Veuillez exécuter la migration fix_rls_performance_and_403_errors';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '====================================';
END $$;
