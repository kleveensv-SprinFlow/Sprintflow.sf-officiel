-- ⚠️ TEST TEMPORAIRE - DÉSACTIVER RLS SUR PROFILES
-- Ceci est UNIQUEMENT pour confirmer que le problème vient des policies RLS
-- NE PAS UTILISER EN PRODUCTION

-- Désactiver RLS temporairement
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Vérifier
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- Si rowsecurity = false, RLS est désactivé
-- Maintenant testez l'application et voyez si elle charge vite

-- ⚠️ IMPORTANT ⚠️
-- Après avoir confirmé que ça marche sans RLS, il faudra :
-- 1. Réactiver RLS : ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- 2. Corriger les policies pour qu'elles soient rapides
