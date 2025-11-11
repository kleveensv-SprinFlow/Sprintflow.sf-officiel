-- 🔥 FIX URGENT - SUPPRIMER LES POLICIES LENTES
-- Le problème : Il y a 3 policies sur profiles, dont 2 sont LENTES
-- PostgreSQL évalue TOUTES les policies, donc si une est lente, tout est lent

-- Supprimer les 2 policies lentes
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can read their athletes profiles" ON profiles;

-- Garder uniquement la policy optimisée
-- (Elle existe déjà, pas besoin de la recréer)

-- Vérifier le résultat
SELECT
  policyname,
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
-- 1 seule ligne : "Users can read accessible profiles" avec status "OPTIMISÉE ✅"
