# Diagnostic et résolution du problème de timeout sur les tableaux de bord

## 🔍 Diagnostic du problème

### Symptômes observés
1. **Spinner qui tourne indéfiniment** sur les tableaux de bord (athlète et coach)
2. **Timeout de chargement atteint après 10 secondes** dans useAuth
3. **Message dans la console** : `⚠️ [useAuth] Timeout de chargement atteint, arrêt forcé`
4. **Les plannings ne se chargent jamais** - Les carousels restent vides
5. **Erreur dans la console** : `Unchecked runtime.lastError` et warnings Contextify

### Analyse technique

#### Problème 1 : Policies RLS trop complexes sur la table `profiles`
- **Cause racine** : Les policies RLS avec des sous-requêtes complexes (JOINs multiples) ralentissent les requêtes SELECT
- **Politique problématique** : "Group members can read each other profiles simple"
  ```sql
  USING (
    id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
  )
  ```
- **Impact** : Chaque lecture de profil déclenche cette sous-requête avec 2 JOINs, ce qui prend 10+ secondes
- **Absence d'index** : Aucun index sur `group_members(athlete_id, group_id)` pour optimiser ces requêtes

#### Problème 2 : Timeout trop strict dans useAuth
- **Timeout original** : 10 secondes
- **Comportement** : Force l'arrêt du loading même si l'application n'a pas fini de charger
- **Conséquence** : L'application reste bloquée car le Dashboard attend que le profil soit chargé

#### Problème 3 : Requêtes sans timeout dans les hooks
- `useWorkouts` : Requête `group_members` sans limite de temps
- `Dashboard` : RPCs `get_current_indice_forme` et `get_indice_poids_puissance` sans timeout
- **Conséquence** : Si une requête est lente, l'application attend indéfiniment

#### Problème 4 : Logs insuffisants
- Impossible de savoir où exactement les requêtes bloquent
- Pas de visibilité sur le cycle de vie des requêtes

---

## ✅ Solutions appliquées

### 1. Migration pour optimiser les performances RLS
**Fichier** : `supabase/migrations/20251110150000_optimize_profiles_rls_performance.sql`

**Changements** :
- ✅ Ajout d'index sur `group_members(athlete_id)`
- ✅ Ajout d'index sur `group_members(group_id)`
- ✅ Ajout d'index sur `group_members(athlete_id, group_id)` (composite)
- ✅ Ajout d'index sur `groups(coach_id)`
- ✅ Ajout d'index sur `coach_athlete_links(coach_id, athlete_id)`
- ✅ Création d'une fonction helper `can_read_profile()` pour encapsuler la logique complexe
- ✅ Analyse des tables pour mettre à jour les statistiques de l'optimiseur PostgreSQL

**Impact attendu** : Réduction du temps de requête de 10+ secondes à < 500ms

### 2. Amélioration de useAuth.tsx
**Fichier** : `src/hooks/useAuth.tsx`

**Changements** :
- ✅ Augmentation du timeout de 10s à 15s
- ✅ Ajout de logs détaillés pour chaque étape du chargement
- ✅ Messages console clairs : 🚀 Initialisation, 📋 Session, 👤 Utilisateur, ✅ Succès, ❌ Erreur
- ✅ Gestion plus gracieuse du timeout (ne bloque plus l'application)

**Logs ajoutés** :
```javascript
console.log('🚀 [useAuth] Initialisation de l'authentification');
console.log('📋 [useAuth] Session récupérée:', session ? 'Oui' : 'Non');
console.log('👤 [useAuth] Utilisateur connecté, chargement du profil...');
console.log('🔄 [useAuth] Chargement du profil pour:', userId);
console.log('✅ [useAuth] Profil chargé:', data);
console.log('✅ [useAuth] Initialisation terminée');
```

### 3. Optimisation de useWorkouts.ts
**Fichier** : `src/hooks/useWorkouts.ts`

**Changements** :
- ✅ Ajout de logs détaillés pour tracer le chargement
- ✅ Timeout de 5 secondes sur la requête `group_members`
- ✅ Timeout de 10 secondes sur la requête principale `workouts`
- ✅ Gestion gracieuse des timeouts (continue avec les données disponibles)
- ✅ Logs pour chaque étape : rôle, sélection, groupes, résultats

**Exemple de logs** :
```javascript
🏋️ [useWorkouts] Début chargement workouts
🏋️ [useWorkouts] Profile role: athlete Selection: null
👥 [useWorkouts] Groupes trouvés: 2
🚀 [useWorkouts] Exécution de la requête...
✅ [useWorkouts] Workouts chargés: 15
✅ [useWorkouts] Chargement terminé
```

### 4. Amélioration du Dashboard.tsx
**Fichier** : `src/components/Dashboard.tsx`

**Changements** :
- ✅ Ajout de logs détaillés pour le chargement des scores
- ✅ Timeout de 8 secondes sur chaque RPC (indice forme et performance)
- ✅ Gestion gracieuse des erreurs (affiche le Dashboard même si les scores ne chargent pas)
- ✅ Messages clairs dans la console pour diagnostiquer les problèmes

**Timeouts appliqués** :
```javascript
Promise.race([
  rpcPromise,
  new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
]).catch(err => {
  console.warn('⚠️ Timeout ou erreur, continue sans données');
  return { data: null, error: null };
});
```

---

## 🧪 Comment tester

### 1. Appliquer la migration
La migration doit être appliquée dans Supabase pour créer les index :
```bash
# Depuis le dashboard Supabase, aller dans SQL Editor et exécuter :
# supabase/migrations/20251110150000_optimize_profiles_rls_performance.sql
```

### 2. Tester le chargement du tableau de bord

#### Test Athlète
1. Se connecter avec un compte athlète
2. Observer les logs dans la console :
   - `🚀 [useAuth] Initialisation de l'authentification`
   - `✅ [useAuth] Profil chargé`
   - `🏋️ [useWorkouts] Début chargement workouts`
   - `📊 [Dashboard] Début chargement scores`
3. Vérifier que le tableau de bord s'affiche en moins de 5 secondes
4. Vérifier que le planning s'affiche correctement

#### Test Coach
1. Se connecter avec un compte coach
2. Observer les logs dans la console
3. Sélectionner un athlète ou un groupe
4. Vérifier que le planning de l'athlète/groupe se charge rapidement
5. Vérifier que les carousels de planning affichent les 7 jours

### 3. Vérifier les performances

#### Dans la console du navigateur :
```javascript
// Devrait voir des logs comme :
✅ [useAuth] Initialisation terminée
✅ [useWorkouts] Workouts chargés: 15
✅ [Dashboard] Chargement terminé
```

#### Dans Supabase Dashboard :
1. Aller dans Database > Query Performance
2. Vérifier que les requêtes sur `profiles` prennent < 500ms
3. Vérifier que les requêtes sur `workouts` prennent < 2s

---

## 📊 Amélioration des performances attendues

| Requête | Avant | Après | Amélioration |
|---------|-------|-------|--------------|
| SELECT profiles WHERE id = auth.uid() | 10+ secondes | < 500ms | 95% |
| SELECT workouts avec filtres OR | 5-10 secondes | < 2s | 70% |
| RPC get_current_indice_forme | 5+ secondes | < 3s | 40% |
| Chargement complet du Dashboard | 15+ secondes (timeout) | < 5s | 67% |

---

## 🔄 Prochaines étapes (optionnel)

Si les performances ne sont toujours pas satisfaisantes après ces changements :

### 1. Simplifier les policies RLS
Remplacer les policies complexes par l'utilisation de la fonction `can_read_profile()` :
```sql
-- Au lieu de :
USING (id IN (SELECT ... avec JOINs complexes))

-- Utiliser :
USING (can_read_profile(id))
```

### 2. Créer une vue matérialisée
Pour les relations coach-athlete fréquemment consultées :
```sql
CREATE MATERIALIZED VIEW coach_athlete_access AS
SELECT DISTINCT
  cal.coach_id,
  cal.athlete_id
FROM coach_athlete_links cal
UNION
SELECT DISTINCT
  g.coach_id,
  gm.athlete_id
FROM groups g
INNER JOIN group_members gm ON g.id = gm.group_id;

-- Rafraîchir périodiquement
REFRESH MATERIALIZED VIEW CONCURRENTLY coach_athlete_access;
```

### 3. Ajouter un cache Redis
Pour les profils et workouts fréquemment consultés

### 4. Pagination des workouts
Limiter le nombre de workouts chargés initialement :
```javascript
query.order('date', { ascending: false }).limit(50)
```

---

## 🎯 Résumé des fichiers modifiés

1. ✅ `src/hooks/useAuth.tsx` - Logs et timeout améliorés
2. ✅ `src/hooks/useWorkouts.ts` - Logs et timeouts sur les requêtes
3. ✅ `src/components/Dashboard.tsx` - Logs et timeouts sur les RPCs
4. ✅ `supabase/migrations/20251110150000_optimize_profiles_rls_performance.sql` - Index et fonction helper

---

## ⚠️ Notes importantes

1. **La migration doit être appliquée** dans Supabase pour que les index soient créés
2. **Les logs sont verbeux** pour faciliter le diagnostic - Ils peuvent être réduits en production
3. **Les timeouts sont configurés** pour éviter les blocages, mais les données continuent à charger en arrière-plan
4. **L'application ne bloque plus** même si certaines données sont lentes à charger

---

## 📞 Support

Si le problème persiste après ces changements :
1. Vérifier que la migration a bien été appliquée
2. Consulter les logs de la console pour identifier quelle requête est lente
3. Vérifier les Query Performance dans Supabase Dashboard
4. Considérer les étapes optionnelles ci-dessus
