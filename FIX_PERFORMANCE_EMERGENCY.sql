-- 🚨 FIX D'URGENCE - DÉSACTIVER RLS TEMPORAIREMENT SUR PROFILES
-- Cela va permettre de voir si le problème vient des policies RLS

-- ATTENTION : Cette solution est TEMPORAIRE pour diagnostiquer le problème
-- Ne pas utiliser en production sans refaire les policies correctement

-- Étape 1 : Désactiver RLS sur profiles (TEMPORAIRE)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Étape 2 : Vérifier que RLS est désactivé
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- Si rowsecurity = false, c'est bon !

-- ⚠️ NOTE IMPORTANTE ⚠️
-- Cette solution retire la sécurité sur la table profiles.
-- C'est acceptable pour diagnostiquer le problème.
-- Une fois le problème identifié, nous réactiverons RLS avec des policies optimisées.
