/*
  # Script de Diagnostic des Performances SQL - SprintFlow

  Ce script permet d'identifier les problèmes de performance dans les requêtes
  critiques de l'application, notamment le chargement du profil utilisateur.

  ## Comment utiliser ce script:
  1. Ouvrir la console SQL de Supabase (SQL Editor)
  2. Copier-coller chaque section séparément
  3. Remplacer 'YOUR_USER_UUID_HERE' par un UUID utilisateur réel de votre base
  4. Analyser les résultats pour identifier les goulots d'étranglement

  ## Temps de réponse attendus:
  - Chargement profil personnel: < 100ms
  - Requête can_read_profile: < 200ms
  - Requêtes avec JOINs sur groupes: < 500ms

  ## Problèmes à surveiller:
  - Seq Scan (balayage séquentiel) au lieu d'Index Scan
  - Nested Loop avec coût élevé
  - Temps d'exécution > 1000ms
  - Manque d'index sur les colonnes de filtrage
*/

-- ============================================
-- SECTION 1: VÉRIFICATION DES POLICIES RLS
-- ============================================

-- Lister toutes les policies SELECT actives sur profiles
-- ATTENDU: Exactement 2 policies ("Users read own profile FAST" et "Users read accessible profiles via groups")
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE
        WHEN length(qual) > 100 THEN left(qual, 100) || '...'
        ELSE qual
    END as condition_tronquee,
    CASE
        WHEN with_check IS NOT NULL AND length(with_check) > 100 THEN left(with_check, 100) || '...'
        WHEN with_check IS NOT NULL THEN with_check
        ELSE 'N/A'
    END as with_check_tronque
FROM pg_policies
WHERE tablename = 'profiles' AND cmd = 'SELECT'
ORDER BY policyname;

-- Compter les policies par type
SELECT
    cmd as commande,
    COUNT(*) as nombre_policies
FROM pg_policies
WHERE tablename = 'profiles'
GROUP BY cmd
ORDER BY cmd;

-- ============================================
-- SECTION 2: REQUÊTE DE CHARGEMENT DE PROFIL (CRITIQUE)
-- ============================================

-- IMPORTANT: Remplacer 'YOUR_USER_UUID_HERE' par un UUID réel avant d'exécuter
-- Cette requête simule le chargement du profil dans useAuth.tsx

-- Test 1: EXPLAIN sans exécution (rapide, donne le plan)
EXPLAIN
SELECT id, full_name, first_name, last_name, role, photo_url
FROM profiles
WHERE id = 'YOUR_USER_UUID_HERE';

-- Test 2: EXPLAIN ANALYZE avec exécution complète (donne le temps réel)
-- ATTENTION: Ceci exécute réellement la requête avec RLS actif
EXPLAIN (ANALYZE, BUFFERS, VERBOSE, TIMING)
SELECT id, full_name, first_name, last_name, role, photo_url
FROM profiles
WHERE id = 'YOUR_USER_UUID_HERE';

-- Test 3: Mesure du temps réel d'exécution (100 fois pour moyenne)
DO $$
DECLARE
    v_start_time timestamp;
    v_end_time timestamp;
    v_duration numeric;
    v_user_id uuid := 'YOUR_USER_UUID_HERE'; -- REMPLACER ICI
    v_profile_count integer;
BEGIN
    v_start_time := clock_timestamp();

    FOR i IN 1..100 LOOP
        SELECT COUNT(*) INTO v_profile_count
        FROM profiles
        WHERE id = v_user_id;
    END LOOP;

    v_end_time := clock_timestamp();
    v_duration := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000 / 100;

    RAISE NOTICE 'Temps moyen d''exécution sur 100 requêtes: % ms', round(v_duration, 2);
    RAISE NOTICE 'Profils trouvés à chaque itération: %', v_profile_count;
END $$;

-- ============================================
-- SECTION 3: TEST DE LA FONCTION can_read_profile
-- ============================================

-- Test de performance de la fonction helper
EXPLAIN (ANALYZE, BUFFERS)
SELECT can_read_profile('YOUR_USER_UUID_HERE');

-- Vérifier le contenu de la fonction
SELECT
    proname as fonction,
    prosrc as code_source
FROM pg_proc
WHERE proname = 'can_read_profile';

-- ============================================
-- SECTION 4: VÉRIFICATION DES INDEX
-- ============================================

-- Lister tous les index sur les tables critiques
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'group_members', 'groups', 'coach_athlete_links', 'workouts')
ORDER BY tablename, indexname;

-- Vérifier l'utilisation des index (statistiques)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as nombre_utilisations,
    idx_tup_read as lignes_lues,
    idx_tup_fetch as lignes_recuperees
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'group_members', 'groups', 'coach_athlete_links')
ORDER BY idx_scan DESC;

-- Identifier les index inutilisés (candidats à suppression)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as utilisations
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE '%_pkey'  -- Exclure les clés primaires
ORDER BY tablename, indexname;

-- ============================================
-- SECTION 5: STATISTIQUES DES TABLES
-- ============================================

-- Vérifier la fraîcheur des statistiques (important pour le planificateur)
SELECT
    schemaname,
    tablename,
    n_live_tup as lignes_vivantes,
    n_dead_tup as lignes_mortes,
    n_mod_since_analyze as modifications_depuis_analyze,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'group_members', 'groups', 'coach_athlete_links', 'workouts')
ORDER BY tablename;

-- Bloat (gonflement) des tables
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as taille_totale,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as taille_table,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as taille_indexes
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'group_members', 'groups', 'coach_athlete_links', 'workouts')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- SECTION 6: TEST DES REQUÊTES COMPLEXES
-- ============================================

-- Test 1: Requête de lecture de profils dans un groupe commun
-- Simule l'accès aux profils des membres d'un même groupe
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.id, p.full_name, p.role
FROM profiles p
WHERE EXISTS (
    SELECT 1
    FROM group_members gm1
    INNER JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.athlete_id = 'YOUR_USER_UUID_HERE'  -- REMPLACER
      AND gm2.athlete_id = p.id
    LIMIT 1
);

-- Test 2: Requête coach → athlètes
-- Simule l'accès d'un coach aux profils de ses athlètes
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.id, p.full_name, p.role
FROM profiles p
WHERE EXISTS (
    SELECT 1
    FROM group_members gm
    INNER JOIN groups g ON g.id = gm.group_id
    WHERE g.coach_id = 'YOUR_USER_UUID_HERE'  -- REMPLACER par UUID coach
      AND gm.athlete_id = p.id
    LIMIT 1
);

-- ============================================
-- SECTION 7: DÉTECTION DE SEQUENTIAL SCANS
-- ============================================

-- Cette requête identifie les tables qui font beaucoup de Seq Scans
-- (signe qu'un index manque ou n'est pas utilisé)
SELECT
    schemaname,
    tablename,
    seq_scan as nombre_seq_scans,
    seq_tup_read as lignes_lues_seq_scan,
    idx_scan as nombre_index_scans,
    CASE
        WHEN seq_scan + idx_scan = 0 THEN 0
        ELSE round(100.0 * seq_scan / (seq_scan + idx_scan), 2)
    END as pourcentage_seq_scan
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'group_members', 'groups', 'coach_athlete_links')
ORDER BY seq_scan DESC;

-- ============================================
-- SECTION 8: ACTIONS CORRECTIVES RECOMMANDÉES
-- ============================================

-- Si les statistiques sont anciennes, exécuter:
-- ANALYZE profiles;
-- ANALYZE group_members;
-- ANALYZE groups;
-- ANALYZE coach_athlete_links;

-- Si des lignes mortes s'accumulent, exécuter:
-- VACUUM ANALYZE profiles;
-- VACUUM ANALYZE group_members;

-- Si un Sequential Scan est détecté au lieu d'Index Scan, vérifier:
-- 1. L'index existe (section 4)
-- 2. Les statistiques sont à jour (section 5)
-- 3. La requête utilise bien la colonne indexée dans WHERE

-- ============================================
-- SECTION 9: TEST FINAL DE PERFORMANCE
-- ============================================

-- Ce test mesure le temps de la stack complète:
-- auth.uid() + RLS policies + requête SELECT
-- C'est le scénario réel de l'application

DO $$
DECLARE
    v_start_time timestamp;
    v_end_time timestamp;
    v_duration numeric;
    v_user_id uuid := 'YOUR_USER_UUID_HERE'; -- REMPLACER ICI
    v_profile record;
BEGIN
    -- Simuler la session utilisateur (remplacer par un vrai test si possible)
    v_start_time := clock_timestamp();

    -- Requête identique à celle de useAuth.tsx
    SELECT id, full_name, first_name, last_name, role, photo_url
    INTO v_profile
    FROM profiles
    WHERE id = v_user_id;

    v_end_time := clock_timestamp();
    v_duration := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'TEST FINAL DE PERFORMANCE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Temps d''exécution: % ms', round(v_duration, 2);
    RAISE NOTICE 'Profil trouvé: %', (v_profile IS NOT NULL);

    IF v_duration > 1000 THEN
        RAISE WARNING '⚠️  ALERTE: Temps > 1000ms - Optimisation urgente requise!';
    ELSIF v_duration > 500 THEN
        RAISE WARNING '⚠️  ATTENTION: Temps > 500ms - Optimisation recommandée';
    ELSIF v_duration > 200 THEN
        RAISE NOTICE '✓ Acceptable mais peut être amélioré (< 200ms idéal)';
    ELSE
        RAISE NOTICE '✅ EXCELLENT: Performance optimale!';
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

/*
INTERPRÉTATION DES RÉSULTATS EXPLAIN ANALYZE:

1. Index Scan vs Seq Scan:
   - Index Scan = BON (utilise l'index, rapide)
   - Seq Scan = MAUVAIS (parcourt toute la table, lent)
   - Bitmap Index Scan = ACCEPTABLE (bon pour conditions multiples)

2. Coûts:
   - cost=0.00..8.27 : Coût estimé (unités arbitraires)
   - actual time=0.015..0.016 : Temps réel en millisecondes
   - rows=1 : Nombre de lignes retournées

3. Nested Loop:
   - Avec Index Scan = BON
   - Avec Seq Scan = MAUVAIS (exponentiel)

4. Buffers:
   - shared hit = Données en cache (rapide)
   - shared read = Lecture disque (lent)
   - Ratio hit/read devrait être > 90%

5. Planning Time vs Execution Time:
   - Planning Time: Temps pour créer le plan d'exécution
   - Execution Time: Temps réel d'exécution
   - Si Planning Time > 10ms → Statistiques obsolètes (ANALYZE)
   - Si Execution Time > 1000ms → Requête à optimiser

OBJECTIFS DE PERFORMANCE:
- Chargement profil personnel: < 100ms (cible), < 300ms (acceptable)
- Requête avec groupes: < 500ms (cible), < 1000ms (acceptable)
- can_read_profile(): < 200ms

SI LES PERFORMANCES SONT MAUVAISES:
1. Vérifier que les index de la migration 20251110150000 existent
2. Exécuter ANALYZE sur toutes les tables
3. Vérifier que les 2 policies RLS de la migration 20251115105045 sont actives
4. Chercher les Seq Scan dans EXPLAIN ANALYZE
5. Vérifier le ratio cache (shared hit / shared read)
*/
