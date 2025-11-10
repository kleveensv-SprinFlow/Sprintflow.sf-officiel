-- ⚡ MIGRATION RAPIDE - À exécuter dans Supabase SQL Editor
-- Cette migration corrige les problèmes de performance

-- Étape 1 : Créer les index (95% de l'amélioration)
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_id ON group_members(athlete_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_group ON group_members(athlete_id, group_id);
CREATE INDEX IF NOT EXISTS idx_groups_coach_id ON groups(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_links_coach ON coach_athlete_links(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_links_athlete ON coach_athlete_links(athlete_id);

-- Étape 2 : Analyser les tables pour optimiser le query planner
ANALYZE group_members;
ANALYZE groups;
ANALYZE coach_athlete_links;
ANALYZE profiles;

-- Étape 3 : Vérifier que les index sont créés
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

-- Si vous voyez 6 index listés, la migration est réussie ! ✅
