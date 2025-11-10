-- 🔥 FIX FINAL COMPLET - RÉSOUT LE PROBLÈME DE TIMEOUT
-- Copier-coller TOUT ce fichier dans Supabase SQL Editor et exécuter

-- ============================================
-- PARTIE 1 : CRÉER LES INDEX
-- ============================================
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_id ON group_members(athlete_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_group ON group_members(athlete_id, group_id);
CREATE INDEX IF NOT EXISTS idx_groups_coach_id ON groups(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_links_coach ON coach_athlete_links(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_links_athlete ON coach_athlete_links(athlete_id);

-- ============================================
-- PARTIE 2 : ANALYSER LES TABLES
-- ============================================
ANALYZE group_members;
ANALYZE groups;
ANALYZE coach_athlete_links;
ANALYZE profiles;

-- ============================================
-- PARTIE 3 : CRÉER LA FONCTION HELPER
-- ============================================
CREATE OR REPLACE FUNCTION public.can_read_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    -- Cas 1: C'est son propre profil
    SELECT 1 WHERE profile_id = auth.uid()

    UNION

    -- Cas 2: C'est un profil dans un groupe commun
    SELECT 1
    FROM group_members gm1
    INNER JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.athlete_id = auth.uid()
      AND gm2.athlete_id = profile_id

    UNION

    -- Cas 3: Je suis coach et c'est un de mes athlètes
    SELECT 1
    FROM group_members gm
    INNER JOIN groups g ON g.id = gm.group_id
    WHERE g.coach_id = auth.uid()
      AND gm.athlete_id = profile_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_read_profile TO authenticated;

-- ============================================
-- PARTIE 4 : REMPLACER LES POLICIES PAR LA FONCTION
-- ============================================
-- Supprimer toutes les policies SELECT existantes
DROP POLICY IF EXISTS "Allow user to read own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can read athlete profiles in their groups" ON profiles;
DROP POLICY IF EXISTS "Group members can read each other profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read accessible profiles" ON profiles;

-- Créer UNE SEULE policy optimisée
CREATE POLICY "Users can read accessible profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (can_read_profile(id));

-- ============================================
-- PARTIE 5 : VÉRIFICATION
-- ============================================
-- Vérifier les index (devrait retourner 6 lignes)
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

-- ============================================
-- ✅ FIN DU SCRIPT
-- ============================================
-- Si vous voyez 6 index listés ci-dessus, la migration est réussie !
-- Rafraîchissez l'application (F5) et le chargement devrait être < 5 secondes
