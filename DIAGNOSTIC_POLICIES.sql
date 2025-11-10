-- 🔍 DIAGNOSTIC DES POLICIES - Vérifier l'état actuel

-- 1. Vérifier toutes les policies SELECT sur profiles
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual::text as condition
FROM pg_policies
WHERE tablename = 'profiles'
  AND cmd = 'SELECT'
ORDER BY policyname;

-- 2. Vérifier si la fonction can_read_profile existe
SELECT
  proname,
  prosrc
FROM pg_proc
WHERE proname = 'can_read_profile';

-- 3. Vérifier les index créés
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_group_members%'
    OR indexname LIKE 'idx_groups%'
    OR indexname LIKE 'idx_coach_athlete%'
  )
ORDER BY tablename, indexname;

-- 4. Test de performance simple
EXPLAIN ANALYZE
SELECT *
FROM profiles
WHERE id = '92b814e0-781e-4cbb-bab8-2233282602fe';
