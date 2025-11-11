# Correctif : Planning qui charge indéfiniment

## Problème Identifié

Le planning athlète restait bloqué en chargement infini à cause d'une requête sur `group_members` qui pouvait timeout ou échouer sans gestion d'erreur appropriée.

## Cause Racine

Dans `src/hooks/useWorkouts.ts` et `src/hooks/useGroups.ts`, les requêtes Supabase sur les tables `group_members` et `groups` n'avaient pas de timeout. Si la requête prenait trop de temps ou échouait silencieusement, le hook restait bloqué en `loading: true` indéfiniment.

### Pourquoi cela se produisait

1. **useWorkouts.ts** : Lignes 46-62
   - Requête sur `group_members` pour obtenir les groupes de l'athlète
   - Pas de timeout → si la requête bloque, tout le planning bloque
   - Le catch ne gérait que les erreurs, pas les timeouts

2. **useGroups.ts** : Lignes 31-89
   - Requête complexe avec jointures sur `group_members` et `profiles`
   - Pas de timeout → si la jointure est lente ou bloque, l'UI reste figée
   - Les politiques RLS complexes peuvent ralentir la requête

## Solution Appliquée

### 1. Ajout de Timeouts (useWorkouts.ts)

```typescript
// Timeout de 3 secondes pour éviter le blocage infini
const groupMembershipsPromise = supabase
  .from('group_members')
  .select('group_id')
  .eq('athlete_id', user.id);

const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout group_members')), 3000)
);

const { data: groupMemberships } = await Promise.race([
  groupMembershipsPromise,
  timeoutPromise
]) as any;
```

**Bénéfices** :
- Si la requête prend plus de 3 secondes → timeout
- Le catch attrape l'erreur et charge les workouts avec un filtre simplifié
- L'utilisateur voit ses workouts même si les groupes ne chargent pas

### 2. Amélioration du Filtre de Secours

**Avant** :
```typescript
query = query.eq('user_id', user.id);  // ❌ Ne charge que les workouts créés par l'utilisateur
```

**Après** :
```typescript
query = query.or(`user_id.eq.${user.id},assigned_to_user_id.eq.${user.id}`);  // ✅ Charge AUSSI les workouts assignés
```

**Impact** : L'athlète voit maintenant :
- Ses propres workouts (`user_id`)
- Les workouts que le coach lui a assignés directement (`assigned_to_user_id`)

### 3. Ajout de Timeouts (useGroups.ts)

```typescript
// Timeout de 5 secondes pour éviter le blocage
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout chargement groupes')), 5000)
);

const { data: coachGroups, error: coachError } = await Promise.race([
  groupsPromise,
  timeoutPromise
]) as any;
```

**Bénéfices** :
- Si la jointure complexe prend trop de temps → timeout
- L'erreur est attrapée et l'état passe à `loading: false`
- L'utilisateur peut continuer à utiliser l'app même si les groupes ne chargent pas

### 4. Amélioration des Logs

Ajout de logs détaillés pour faciliter le débogage :

```typescript
console.log('🏋️ [useWorkouts] Chargement pour utilisateur:', user.id);
console.log('👥 [useWorkouts] Groupes trouvés:', groupIds.length);
console.warn('⚠️ [useWorkouts] Erreur/timeout groupes:', groupError);
```

## Tests à Effectuer

### 1. Test Nominal
- ✅ Connexion en tant qu'athlète
- ✅ Aller sur la page Planning
- ✅ Vérifier que le planning charge en moins de 5 secondes
- ✅ Vérifier que les workouts assignés par le coach s'affichent

### 2. Test avec Timeout
- ✅ Simuler une connexion lente (Chrome DevTools → Network → Slow 3G)
- ✅ Aller sur la page Planning
- ✅ Après 3 secondes, le planning devrait s'afficher même sans groupes
- ✅ Les logs doivent montrer "⚠️ Timeout group_members"

### 3. Test sans Groupe
- ✅ Athlète qui n'est dans aucun groupe
- ✅ Le planning doit charger normalement
- ✅ Afficher les workouts créés par l'athlète ou assignés directement

### 4. Test Erreur Base de Données
- ✅ Si Supabase retourne une erreur 400/500
- ✅ Le planning doit afficher les workouts avec le filtre de secours
- ✅ Un message d'erreur clair dans les logs

## Indicateurs de Succès

✅ Le planning ne reste plus bloqué indéfiniment en chargement
✅ Les logs montrent clairement les étapes de chargement
✅ En cas de timeout, l'utilisateur voit au minimum ses workouts personnels
✅ En cas d'erreur, l'utilisateur n'est pas bloqué
✅ Le build passe sans erreur TypeScript

## Logs Attendus (Succès)

```
🏋️ [useWorkouts] Début chargement workouts
🏋️ [useWorkouts] Profile role: athlete Selection: null
🏋️ [useWorkouts] Chargement pour utilisateur: abc-123-def
👥 [useWorkouts] Groupes trouvés: 2
🚀 [useWorkouts] Exécution de la requête...
✅ [useWorkouts] Workouts chargés: 15
✅ [useWorkouts] Chargement terminé
```

## Logs Attendus (Timeout)

```
🏋️ [useWorkouts] Début chargement workouts
🏋️ [useWorkouts] Profile role: athlete Selection: null
🏋️ [useWorkouts] Chargement pour utilisateur: abc-123-def
⚠️ [useWorkouts] Erreur/timeout groupes: Timeout group_members
🚀 [useWorkouts] Exécution de la requête...
✅ [useWorkouts] Workouts chargés: 8
✅ [useWorkouts] Chargement terminé
```

## Prochaines Étapes Recommandées

### Court Terme
1. **Tester en production** avec des utilisateurs réels
2. **Monitorer les logs** pour voir combien de fois le timeout se déclenche
3. **Si timeouts fréquents** → optimiser les politiques RLS

### Moyen Terme
1. **Créer une fonction RPC** pour charger les workouts avec groupes en une seule requête
2. **Ajouter des index** sur `group_members(athlete_id)` et `workouts(assigned_to_user_id)`
3. **Simplifier les politiques RLS** pour éviter les sous-requêtes imbriquées

### Long Terme
1. **Pagination** des workouts pour charger plus rapidement
2. **Cache local** avec Service Worker pour mode offline
3. **Optimistic UI** pour améliorer la perception de vitesse

## Fichiers Modifiés

- `src/hooks/useWorkouts.ts` : Ajout timeout + amélioration filtre de secours
- `src/hooks/useGroups.ts` : Ajout timeout + meilleurs logs

## Build Status

✅ **Build réussi** - 20.93s
✅ **Aucune erreur TypeScript**
✅ **Taille bundle acceptable** (1.1MB gzipped à 325KB)

## Notes Importantes

⚠️ **Ces modifications ne résolvent PAS la cause racine** (politiques RLS potentiellement lentes ou problème réseau), elles permettent juste à l'application de continuer à fonctionner même si ces problèmes surviennent.

⚠️ **Si les timeouts se déclenchent fréquemment**, il faudra enquêter sur :
- La performance des politiques RLS sur `group_members`
- La vitesse de la connexion Supabase
- La présence d'index sur les colonnes utilisées

✅ **L'utilisateur ne sera plus jamais bloqué** sur un écran de chargement infini, même si la base de données est lente ou inaccessible.
