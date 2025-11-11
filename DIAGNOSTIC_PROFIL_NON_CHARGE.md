# Diagnostic : Profil non chargé après connexion

## Symptômes Observés

Après connexion, l'application :
- ✅ L'utilisateur est connecté (user ID visible dans les logs)
- ❌ Le profil reste `undefined`
- ❌ Pas de photo de profil
- ❌ Pas de groupes visibles
- ❌ Les workouts timeout à cause de l'absence du profil

## Logs Actuels

```
🚀 [useAuth] Initialisation de l'authentification
🔄 [useAuth] Chargement du profil pour: 92b814e0-781e-4cbb-bab8-2233282602fe
👤 [useAuth] Aucun utilisateur connecté  // ⚠️ FAUX, utilisateur connecté
✅ [useAuth] Initialisation terminée

🏋️ [useWorkouts] Profile role: undefined Selection: undefined
⚠️ [useWorkouts] Erreur/timeout groupes: Timeout group_members
```

## Analyse du Problème

### 1. Cause Racine Identifiée

La requête `SELECT * FROM profiles WHERE id = '...'` **PREND TROP DE TEMPS** à cause de la politique RLS complexe.

**Migration 20251110160000** a créé une policy qui utilise `can_read_profile(id)` :

```sql
CREATE POLICY "Users can read accessible profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (can_read_profile(id));
```

**La fonction `can_read_profile`** fait 3 vérifications avec UNION :

1. ✅ C'est son propre profil : `profile_id = auth.uid()`
2. ⚠️ Profil dans un groupe commun : JOIN sur `group_members`
3. ⚠️ Je suis coach de cet athlète : JOIN sur `groups`

**PROBLÈME** : Même pour lire son propre profil, PostgreSQL évalue TOUTES les branches du UNION, ce qui déclenche des JOINs coûteux.

### 2. Pourquoi le Timeout de 3s/8s se Déclenche

Dans `useWorkouts.ts`, on charge les workouts qui nécessitent :
1. Le `profile.role` pour savoir si c'est un coach ou athlète
2. Les `group_members` pour charger les workouts de groupe

**Scénario actuel** :
1. User connecté → `loadProfileInline` appelé
2. Query `SELECT ... FROM profiles WHERE id = user_id`
3. RLS policy appelle `can_read_profile(id)`
4. Fonction fait des JOINs sur `group_members` et `groups`
5. Si l'utilisateur a beaucoup de groupes → LENT (> 8s)
6. Pendant ce temps, `useWorkouts` démarre
7. Profile toujours `undefined` → query `group_members` timeout

### 3. Autres Problèmes Identifiés

**a) Double chargement au démarrage**

Les logs montrent que `loadProfileInline` est appelé plusieurs fois :
- Une fois dans `initAuth()`
- Plusieurs fois dans `onAuthStateChange`

**b) `setLoading(false)` était appelé dans `onAuthStateChange`**

Cela réinitialisait le loading à false AVANT que le profil soit chargé, créant une race condition.

## Solutions Appliquées

### ✅ 1. Meilleurs Logs dans useAuth

```typescript
if (!data) {
  console.warn("⚠️ [useAuth] Aucun profil trouvé pour l'utilisateur:", userId);
  return;
}
console.log('✅ [useAuth] Profil chargé:', data);
```

**Impact** : On saura exactement si le profil est trouvé ou pas

### ✅ 2. Timeout Augmenté de 3s à 8s

```typescript
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout group_members')), 8000)
);
```

**Impact** : Donne plus de temps à la requête de se terminer

### ✅ 3. Suppression du `setLoading(false)` dans onAuthStateChange

```typescript
// Ne pas mettre loading à false ici car c'est déjà fait dans initAuth
// setLoading(false);
```

**Impact** : Évite une race condition

## Solutions À Appliquer (Recommandées)

### 🔧 Solution 1 : Optimiser la Fonction RLS (URGENT)

La fonction `can_read_profile` devrait utiliser `OR` au lieu de `UNION` pour que PostgreSQL puisse court-circuiter :

```sql
CREATE OR REPLACE FUNCTION public.can_read_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT (
    -- Cas 1: C'est son propre profil (court-circuit immédiat)
    profile_id = auth.uid()
    OR
    -- Cas 2: C'est un profil dans un groupe commun
    EXISTS (
      SELECT 1
      FROM group_members gm1
      INNER JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
        AND gm2.athlete_id = profile_id
    )
    OR
    -- Cas 3: Je suis coach et c'est un de mes athlètes
    EXISTS (
      SELECT 1
      FROM group_members gm
      INNER JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
        AND gm.athlete_id = profile_id
    )
  );
$$;
```

**Changement clé** : `OR` au lieu de `UNION` permet à PostgreSQL de s'arrêter dès que `profile_id = auth.uid()` est vrai.

### 🔧 Solution 2 : Créer une Policy Séparée pour Son Propre Profil

Créer 2 policies au lieu d'une :

```sql
-- Policy 1: ULTRA RAPIDE - Lire son propre profil
CREATE POLICY "Users can read own profile FAST"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy 2: LENTE mais OK - Lire les autres profils
CREATE POLICY "Users can read accessible profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (can_read_profile(id) AND id != auth.uid());
```

**Bénéfice** : La lecture de son propre profil est INSTANTANÉE (pas de fonction, pas de JOIN)

### 🔧 Solution 3 : Ajouter un Cache Local

Dans `useAuth`, cacher le profil dans `localStorage` :

```typescript
const loadProfileInline = async (userId: string) => {
  // 1. Essayer le cache d'abord
  const cached = localStorage.getItem(`profile_${userId}`);
  if (cached) {
    const cachedProfile = JSON.parse(cached);
    if (Date.now() - cachedProfile.timestamp < 60000) { // 1 minute
      console.log('📦 [useAuth] Profil depuis le cache');
      setProfile(cachedProfile.data);
      // Continuer en arrière-plan pour rafraîchir
    }
  }

  // 2. Charger depuis Supabase
  const { data, error } = await supabase.from('profiles').select(...);
  if (data) {
    setProfile(data);
    localStorage.setItem(`profile_${userId}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }
};
```

## Tests À Effectuer

### Test 1 : Vérifier que le Profil Charge

1. Se connecter
2. Ouvrir la console
3. Chercher `✅ [useAuth] Profil chargé:`
4. **SI ABSENT** → Le SELECT sur profiles timeout ou échoue
5. **SI PRÉSENT** → Le profil charge mais ne se propage pas

### Test 2 : Mesurer le Temps de Chargement

```sql
-- Exécuter dans Supabase SQL Editor
EXPLAIN ANALYZE
SELECT id, full_name, first_name, last_name, role, photo_url
FROM profiles
WHERE id = 'VOTRE_USER_ID';
```

**Résultat attendu** : < 100ms
**Si > 1000ms** : La fonction RLS est trop lente

### Test 3 : Vérifier la Policy

```sql
-- Voir toutes les policies sur profiles
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

**Attendu** : 1 ou 2 policies SELECT

## Prochaines Étapes

### Immédiat (à faire maintenant)
1. ✅ Meilleurs logs ajoutés
2. ✅ Timeout augmenté
3. ⏳ **Tester et voir les nouveaux logs**

### Court Terme (si le problème persiste)
1. Appliquer Solution 1 ou 2 pour optimiser RLS
2. Mesurer le temps avec `EXPLAIN ANALYZE`
3. Ajouter un cache local si nécessaire

### Moyen Terme
1. Créer une vue matérialisée pour les relations coach-athlete
2. Pagination des groupes si un coach a > 100 athlètes
3. Implémenter un vrai cache Redis en production

## Indicateurs de Succès

✅ Log `✅ [useAuth] Profil chargé:` apparaît < 500ms après connexion
✅ `Profile role:` n'est plus `undefined` dans les logs
✅ Les groupes chargent sans timeout
✅ La photo de profil s'affiche

## Fichiers Modifiés

- `src/hooks/useAuth.tsx` : Meilleurs logs + suppression race condition
- `src/hooks/useWorkouts.ts` : Timeout augmenté 3s → 8s

## Build Status

✅ Build réussi - 17.00s
✅ Aucune erreur TypeScript
