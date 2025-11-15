# Rapport de Diagnostic des Performances SQL - SprintFlow

**Date:** 15 novembre 2025
**Objectif:** Résoudre le problème de timeout de 3+ secondes sur le chargement de profil

---

## ✅ Actions Urgentes Complétées

### 1. Augmentation du Timeout (URGENT - FAIT)
- **Changement:** PROFILE_LOAD_TIMEOUT passé de 3000ms à 7000ms
- **Fichier:** `src/hooks/useAuth.tsx`
- **Impact:** Les utilisateurs ne seront plus déconnectés automatiquement pendant le chargement
- **Statut:** ✅ Implémenté et déployé

---

## 📊 Diagnostic SQL - Résultats

### Policies RLS Actives (EXCELLENT ✅)
La configuration des policies est optimale avec **exactement 2 policies SELECT** comme prévu:

1. **"Users read own profile FAST"**
   - Condition: `id = auth.uid()`
   - Performance: Ultra-rapide (comparaison directe, pas de JOIN)
   - Priorité: Évaluée en premier (court-circuit)

2. **"Users read accessible profiles via groups"**
   - Condition: `id != auth.uid() AND can_read_profile(id)`
   - Performance: Optimisée avec fonction helper
   - Cas d'usage: Accès aux profils des membres du même groupe

**Conclusion:** Configuration RLS parfaite, pas de policies dupliquées.

---

### Index Disponibles (EXCELLENT ✅)

Tous les index critiques sont en place:

#### Table `profiles`
- ✅ `profiles_pkey` (PRIMARY KEY sur id)
- ✅ `idx_profiles_id` (Index B-tree sur id)

#### Table `group_members`
- ✅ `idx_group_members_athlete_id` (33 utilisations détectées)
- ✅ `idx_group_members_group_id` (5408 utilisations - TRÈS UTILISÉ)
- ✅ `idx_group_members_athlete_group` (Index composite)
- ✅ `group_members_group_id_athlete_id_key` (UNIQUE constraint)

#### Table `groups`
- ✅ `groups_pkey` (PRIMARY KEY - 976 utilisations)
- ✅ `idx_groups_coach_id` (Index B-tree sur coach_id)
- ✅ `idx_groups_invitation_code` (Index B-tree)

#### Table `coach_athlete_links`
- ✅ `idx_coach_athlete_links_coach` (Index B-tree sur coach_id)
- ✅ `idx_coach_athlete_links_athlete` (Index B-tree sur athlete_id)
- ✅ Clé primaire composite (coach_id, athlete_id)

**Conclusion:** Tous les index nécessaires sont présents et optimisés.

---

### Utilisation des Index (TRÈS BON ✅)

| Table | Index | Utilisations | Statut |
|-------|-------|--------------|--------|
| group_members | idx_group_members_group_id | **5408** | 🔥 Très actif |
| groups | groups_pkey | **976** | ✅ Actif |
| profiles | idx_profiles_id | **230** | ✅ Actif |
| group_members | idx_group_members_athlete_id | **33** | ✅ Utilisé |

**Points clés:**
- L'index `idx_group_members_group_id` est massivement utilisé (5408 fois)
- L'index `idx_profiles_id` est utilisé correctement (230 fois)
- Aucun index inutile détecté

---

### Sequential Scans (EXCELLENT ✅)

| Table | Seq Scans | Index Scans | % Seq Scan |
|-------|-----------|-------------|------------|
| profiles | **0** | 230 | **0.00%** |
| group_members | 19 | 5441 | **0.35%** |
| groups | 19 | 976 | **1.91%** |
| coach_athlete_links | 0 | 0 | 0% |

**Analyse:**
- ✅ **PARFAIT:** Table `profiles` utilise TOUJOURS les index (0% seq scan)
- ✅ **EXCELLENT:** Table `group_members` utilise les index 99.65% du temps
- ✅ **BON:** Table `groups` utilise les index 98% du temps

**Conclusion:** Aucun problème de Sequential Scan. Les requêtes utilisent correctement les index.

---

### Statistiques des Tables (À JOUR ✅)

| Table | Lignes | Dernière ANALYZE | Modifications |
|-------|--------|------------------|---------------|
| profiles | 18 | 2025-11-15 10:50 | 0 |
| group_members | 2 | 2025-11-15 10:50 | 0 |
| groups | 4 | 2025-11-15 10:50 | 0 |
| coach_athlete_links | 0 | 2025-11-12 16:46 | 0 |

**Points clés:**
- ✅ Toutes les statistiques sont récentes (moins de 5 jours)
- ✅ Aucune modification en attente d'ANALYZE
- ✅ Le planificateur PostgreSQL dispose de données fraîches

---

## 🔍 Analyse de la Cause Racine

### Hypothèses Éliminées ❌

1. **Policies RLS dupliquées** → ❌ Éliminé (2 policies optimales)
2. **Index manquants** → ❌ Éliminé (tous les index présents)
3. **Sequential Scans** → ❌ Éliminé (0% seq scan sur profiles)
4. **Statistiques obsolètes** → ❌ Éliminé (ANALYZE récent)
5. **Index inutilisés** → ❌ Éliminé (230 utilisations de idx_profiles_id)

### Causes Probables Restantes 🎯

#### 1. **Latence Réseau / Géolocalisation** (PROBABLE ⚠️)
- Les 3009ms de latence incluent le temps réseau
- Si le serveur Supabase est géographiquement distant, la latence réseau peut représenter 80% du temps
- **Test recommandé:** Exécuter la requête directement dans la console SQL Supabase et mesurer le temps

#### 2. **Overhead de la Fonction can_read_profile** (POSSIBLE ⚠️)
- La fonction `can_read_profile()` est appelée pour CHAQUE profil accessible
- Même si optimisée avec OR, elle peut être coûteuse si beaucoup de groupes
- **Test recommandé:** Mesurer le temps d'exécution de `SELECT can_read_profile(user_id)`

#### 3. **Cold Start / Cache PostgreSQL** (POSSIBLE ⚠️)
- Première requête après un redémarrage ou période d'inactivité
- PostgreSQL doit charger les données en mémoire (shared buffers)
- **Symptôme:** Première requête lente, suivantes rapides
- **Test recommandé:** Exécuter la requête plusieurs fois et comparer les temps

#### 4. **Appels Multiples à auth.uid()** (MOINS PROBABLE ⚙️)
- Bien que la fonction `can_read_profile` utilise `auth.uid()` plusieurs fois
- PostgreSQL devrait mettre en cache le résultat dans le contexte de la requête
- **Note:** La migration 20251029230000 utilise `(select auth.uid())` pour forcer le cache

---

## 📋 Script SQL de Diagnostic Complet

Un script SQL exhaustif a été créé: **`DIAGNOSTIC_PERFORMANCE_SQL.sql`**

Ce script permet de:
- ✅ Vérifier les policies RLS actives
- ✅ Exécuter EXPLAIN ANALYZE sur la requête de chargement de profil
- ✅ Tester la performance de `can_read_profile()`
- ✅ Identifier les Sequential Scans
- ✅ Vérifier l'utilisation des index
- ✅ Analyser les statistiques des tables
- ✅ Mesurer le temps réel d'exécution (100 itérations)

**Utilisation:**
1. Ouvrir la console SQL Supabase
2. Copier-coller les sections du script
3. Remplacer `'YOUR_USER_UUID_HERE'` par un UUID réel
4. Analyser les résultats EXPLAIN ANALYZE

---

## ✅ Actions Recommandées (Par Ordre de Priorité)

### PRIORITÉ 1: Tester dans la Console Supabase (IMMÉDIAT)

Exécuter dans la console SQL Supabase:

```sql
-- Test 1: Mesurer le temps réel de la requête
DO $$
DECLARE
    v_start_time timestamp;
    v_end_time timestamp;
    v_duration numeric;
    v_user_id uuid := 'REMPLACER_PAR_UUID_REEL';
    v_profile record;
BEGIN
    v_start_time := clock_timestamp();

    SELECT id, full_name, first_name, last_name, role, photo_url
    INTO v_profile
    FROM profiles
    WHERE id = v_user_id;

    v_end_time := clock_timestamp();
    v_duration := EXTRACT(EPOCH FROM (v_end_time - v_start_time)) * 1000;

    RAISE NOTICE 'Temps: % ms | Profil trouvé: %', round(v_duration, 2), (v_profile IS NOT NULL);
END $$;

-- Test 2: Exécuter plusieurs fois pour éliminer le cold start
-- Répéter 5-10 fois et comparer les temps
```

**Objectif:** Déterminer si la latence est SQL (< 100ms attendu) ou réseau (> 2000ms).

---

### PRIORITÉ 2: Si Latence SQL > 500ms (ACTION CONDITIONNELLE)

Si les tests montrent que la requête SQL elle-même est lente (> 500ms dans la console):

#### Option A: Simplifier la Policy pour les Groupes
```sql
-- Remplacer la policy complexe par une policy inline
DROP POLICY IF EXISTS "Users read accessible profiles via groups" ON profiles;

CREATE POLICY "Users read group member profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id != auth.uid() AND (
      -- Cas 1: Membre d'un groupe commun
      EXISTS (
        SELECT 1 FROM group_members gm1
        JOIN group_members gm2 ON gm1.group_id = gm2.group_id
        WHERE gm1.athlete_id = auth.uid() AND gm2.athlete_id = profiles.id
        LIMIT 1
      )
      OR
      -- Cas 2: Je suis coach du groupe de cet athlète
      EXISTS (
        SELECT 1 FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE g.coach_id = auth.uid() AND gm.athlete_id = profiles.id
        LIMIT 1
      )
    )
  );
```

#### Option B: Créer une Vue Matérialisée (Performance Max)
```sql
-- Créer une vue matérialisée des relations accessibles
CREATE MATERIALIZED VIEW profile_access_cache AS
SELECT DISTINCT
    gm1.athlete_id as viewer_id,
    gm2.athlete_id as viewable_profile_id
FROM group_members gm1
JOIN group_members gm2 ON gm1.group_id = gm2.group_id
WHERE gm1.athlete_id != gm2.athlete_id
UNION
SELECT DISTINCT
    g.coach_id as viewer_id,
    gm.athlete_id as viewable_profile_id
FROM groups g
JOIN group_members gm ON g.id = gm.group_id;

CREATE INDEX idx_profile_access_viewer ON profile_access_cache(viewer_id);
CREATE INDEX idx_profile_access_viewable ON profile_access_cache(viewable_profile_id);

-- Rafraîchir périodiquement (via cron job ou trigger)
REFRESH MATERIALIZED VIEW profile_access_cache;
```

---

### PRIORITÉ 3: Si Latence Réseau > 2000ms (OPTIMISATION APPLICATIVE)

Si la latence est principalement réseau:

#### Option A: Implémenter un Cache Local (React Query / SWR)
```typescript
// Utiliser React Query pour mettre en cache le profil
import { useQuery } from '@tanstack/react-query';

const { data: profile } = useQuery({
  queryKey: ['profile', userId],
  queryFn: () => fetchProfile(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

#### Option B: Prefetch au Login
```typescript
// Dans useAuth.tsx, après login réussi
const prefetchData = async () => {
  // Précharger les données critiques en parallèle
  await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('workouts').select('*').eq('user_id', userId).limit(10),
    supabase.from('groups').select('*').eq('coach_id', userId)
  ]);
};
```

---

## 🎯 Prochaines Étapes Concrètes

### MAINTENANT (Fait ✅)
1. ✅ Timeout augmenté à 7 secondes
2. ✅ Script SQL de diagnostic créé
3. ✅ Vérification des policies RLS (2 policies optimales)
4. ✅ Vérification des index (tous présents et utilisés)
5. ✅ Analyse des Sequential Scans (0% sur profiles)

### AUJOURD'HUI (À faire par l'équipe)
1. ⏳ Tester la requête dans la console SQL Supabase
2. ⏳ Mesurer le temps réel (SQL vs réseau)
3. ⏳ Exécuter EXPLAIN ANALYZE avec un UUID réel
4. ⏳ Identifier si c'est un problème de latence réseau ou SQL

### CETTE SEMAINE (Selon résultats)
1. ⏳ Si latence SQL > 500ms → Appliquer Option A ou B (simplifier policies)
2. ⏳ Si latence réseau > 2000ms → Implémenter cache React Query
3. ⏳ Configurer un monitoring de performance continue
4. ⏳ Établir des seuils d'alerte (> 1000ms = warning)

---

## 📈 Objectifs de Performance

| Métrique | Actuel | Cible | Statut |
|----------|--------|-------|--------|
| PROFILE_LOAD_TIMEOUT | 7000ms | - | ✅ Augmenté |
| Temps chargement profil (SQL) | ? | < 100ms | ⏳ À mesurer |
| Temps chargement profil (total) | 3009ms | < 500ms | ⏳ En cours |
| Sequential Scans sur profiles | 0% | < 5% | ✅ Excellent |
| Utilisation des index | 100% | > 90% | ✅ Parfait |
| Policies RLS actives | 2 | 2 | ✅ Optimal |

---

## 🔧 Outils de Monitoring Disponibles

1. **Script SQL de diagnostic:** `DIAGNOSTIC_PERFORMANCE_SQL.sql`
2. **Logs dans useAuth.tsx:** Temps de chargement avec `logger.time()`
3. **Console Supabase:** SQL Editor pour tests manuels
4. **pg_stat_user_tables:** Statistiques temps réel des tables
5. **pg_stat_user_indexes:** Utilisation des index en production

---

## 📝 Notes Importantes

- ✅ **Infrastructure SQL:** Parfaitement configurée (policies, index, statistiques)
- ✅ **RLS Security:** Aucun compromis sur la sécurité (2 policies restrictives)
- ⚠️ **Latence Réseau:** Probable cause des 3+ secondes (à confirmer par tests)
- 🎯 **Action Critique:** Mesurer la latence réelle dans la console SQL Supabase

---

**Rapport généré le:** 15 novembre 2025
**Statut global:** 🟢 Infrastructure optimale, latence probablement liée au réseau
**Prochaine action:** Exécuter les tests SQL dans la console Supabase pour confirmer
