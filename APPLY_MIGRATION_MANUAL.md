# ⚠️ IMPORTANT: Migration à appliquer manuellement

## Étapes pour appliquer la migration d'optimisation

La migration suivante doit être appliquée dans le **Supabase SQL Editor** pour corriger les problèmes de performance.

### 1. Se connecter à Supabase Dashboard
- Aller sur : https://supabase.com/dashboard/project/kqlzvxfdzandgdkqzggj
- Se connecter avec vos identifiants

### 2. Ouvrir le SQL Editor
- Dans le menu de gauche, cliquer sur "SQL Editor"
- Cliquer sur "New query"

### 3. Copier-coller la migration

Copier tout le contenu du fichier suivant et le coller dans l'éditeur SQL :
```
supabase/migrations/20251110150000_optimize_profiles_rls_performance.sql
```

Ou copier directement ce SQL :

```sql
-- Index pour group_members
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_id ON group_members(athlete_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_group ON group_members(athlete_id, group_id);

-- Index pour groups
CREATE INDEX IF NOT EXISTS idx_groups_coach_id ON groups(coach_id);

-- Index pour coach_athlete_links
CREATE INDEX IF NOT EXISTS idx_coach_athlete_links_coach ON coach_athlete_links(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_athlete_links_athlete ON coach_athlete_links(athlete_id);

-- Analyser les tables
ANALYZE group_members;
ANALYZE groups;
ANALYZE coach_athlete_links;
ANALYZE profiles;

-- Fonction helper
CREATE OR REPLACE FUNCTION public.can_read_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 WHERE profile_id = auth.uid()
    UNION
    SELECT 1
    FROM group_members gm1
    INNER JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.athlete_id = auth.uid()
      AND gm2.athlete_id = profile_id
    UNION
    SELECT 1
    FROM group_members gm
    INNER JOIN groups g ON g.id = gm.group_id
    WHERE g.coach_id = auth.uid()
      AND gm.athlete_id = profile_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.can_read_profile TO authenticated;
```

### 4. Exécuter la requête
- Cliquer sur le bouton "Run" en bas à droite
- Attendre que l'exécution se termine
- Vérifier qu'il n'y a pas d'erreurs

### 5. Vérifier que les index sont créés
Exécuter cette requête pour vérifier :
```sql
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
```

Vous devriez voir au moins 6 index listés.

### 6. Redémarrer l'application
Une fois la migration appliquée, rafraîchir la page de l'application (F5).

## ✅ Résultat attendu

Après avoir appliqué la migration :
- Le chargement du profil devrait passer de 10+ secondes à < 1 seconde
- Le Dashboard devrait s'afficher rapidement
- Les plannings devraient se charger sans timeout
- Les logs dans la console devraient montrer des chargements rapides

## 🔍 Vérification

Dans la console du navigateur, vous devriez voir :
```
🚀 [useAuth] Initialisation de l'authentification
📋 [useAuth] Session récupérée: Oui
👤 [useAuth] Utilisateur connecté, chargement du profil...
✅ [useAuth] Profil chargé: { id: "...", first_name: "...", ... }
✅ [useAuth] Initialisation terminée
```

Sans le message d'erreur :
```
⚠️ [useAuth] Timeout de chargement atteint après 15s
```
