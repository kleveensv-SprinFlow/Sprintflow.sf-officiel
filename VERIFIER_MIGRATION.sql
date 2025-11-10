-- ✅ VÉRIFIER SI LA MIGRATION A ÉTÉ APPLIQUÉE COMPLÈTEMENT

-- Test 1: Vérifier les index (devrait retourner 6 lignes)
SELECT
  'INDEX' as type,
  indexname as name
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_group_members%'
    OR indexname LIKE 'idx_groups%'
    OR indexname LIKE 'idx_coach_athlete%'
  );

-- Test 2: Vérifier la fonction (devrait retourner 1 ligne)
SELECT
  'FUNCTION' as type,
  proname as name
FROM pg_proc
WHERE proname = 'can_read_profile';

-- Test 3: Vérifier les policies (devrait retourner 1 seule policy)
SELECT
  'POLICY' as type,
  policyname as name,
  CASE
    WHEN qual::text LIKE '%can_read_profile%' THEN 'OPTIMISÉE ✅'
    ELSE 'LENTE ❌'
  END as status
FROM pg_policies
WHERE tablename = 'profiles'
  AND cmd = 'SELECT';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- INDEX: 6 lignes
-- FUNCTION: 1 ligne (can_read_profile)
-- POLICY: 1 ligne avec status "OPTIMISÉE ✅"
--
-- Si vous voyez autre chose, la migration n'a pas été complètement appliquée !
