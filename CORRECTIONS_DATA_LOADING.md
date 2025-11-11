# Corrections Data Loading - Workouts, Records et Planning

## Problèmes Identifiés

### 1. Timeouts trop courts dans useWorkouts
- **Problème**: Timeouts de 5s pour les groupes et 10s pour les workouts
- **Conséquence**: Erreurs "Timeout workouts query" et données non chargées
- **Impact**: Dashboard vide, planning et records non affichés

### 2. Sélection explicite des colonnes JSON
- **Problème**: `.select('*, planned_data, workout_data')` ne fonctionne pas correctement
- **Conséquence**: Colonnes JSONB nulles dans les résultats
- **Impact**: Erreurs lors de l'accès aux données de blocs

### 3. Fallback localStorage inutile dans useRecords
- **Problème**: Code complexe avec localStorage qui masque les vraies erreurs
- **Conséquence**: Confusion entre données locales et distantes
- **Impact**: Difficile de déboguer les problèmes Supabase

## Solutions Appliquées

### 1. useWorkouts.ts - Suppression des timeouts artificiels

**AVANT**:
```typescript
const { data: groupMemberships } = await Promise.race([
  groupPromise,
  new Promise<any>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout group memberships')), 5000)
  )
]).catch(err => {
  console.warn('⚠️ [useWorkouts] Timeout groupes, continue sans:', err);
  return { data: [], error: null };
});

const { data, error } = await Promise.race([
  query.order('date', { ascending: false }),
  new Promise<any>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout workouts query')), 10000)
  )
]);
```

**APRÈS**:
```typescript
try {
  const { data: groupMemberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('athlete_id', user.id);

  const groupIds = groupMemberships?.map(m => m.group_id) || [];
  console.log('👥 [useWorkouts] Groupes trouvés:', groupIds.length);

  let filter = `user_id.eq.${user.id}`;
  if (groupIds.length > 0) {
    filter += `,assigned_to_group_id.in.(${groupIds.join(',')})`;
  }
  query = query.or(filter);
} catch (groupError) {
  console.warn('⚠️ [useWorkouts] Erreur groupes, charge uniquement user:', groupError);
  query = query.eq('user_id', user.id);
}

const { data, error } = await query.order('date', { ascending: false });
```

**Avantages**:
- Laisse Supabase gérer ses propres timeouts (plus adaptatifs)
- Gestion d'erreur propre avec try-catch
- Si les groupes échouent, charge quand même les workouts de l'utilisateur
- Logs clairs pour le débogage

### 2. Simplification des .select()

**AVANT**:
```typescript
.select('*, planned_data, workout_data')
```

**APRÈS**:
```typescript
.select('*')
```

**Raison**:
- Supabase retourne automatiquement toutes les colonnes avec `*`
- Spécifier explicitement les colonnes JSONB peut causer des problèmes de sérialisation
- Plus simple et plus fiable

### 3. useRecords.ts - Suppression du fallback localStorage

**AVANT**:
```typescript
if (error) {
  console.error('Erreur chargement records:', error.message)
  const localRecords = localStorage.getItem(`records_${userId}`)
  if (localRecords) {
    try {
      const parsedRecords = JSON.parse(localRecords)
      setRecords(parsedRecords)
    } catch (parseError) {
      console.error('Erreur parsing records locaux:', parseError)
      setRecords([])
    }
  } else {
    setRecords([])
  }
}
```

**APRÈS**:
```typescript
if (error) {
  console.error('Erreur chargement records:', error.message)
  setRecords([])
}
```

**Avantages**:
- Code plus simple et plus lisible
- Erreurs Supabase visibles immédiatement
- Pas de confusion entre données locales/distantes
- Plus facile à déboguer

### 4. usePlanning.ts - Amélioration des logs

**AVANT**:
```typescript
const { data: templates, error } = await supabase
  .from('session_templates')
  .select('*')
  .eq('group_id', groupId)
  .order('created_at', { ascending: false })

if (error) {
  console.error('Erreur chargement planning athlète:', error.message)
  setSessionTemplates([])
}
```

**APRÈS**:
```typescript
console.log('📚 [usePlanning] Chargement planning athlète pour groupe:', groupId)

const { data: templates, error } = await supabase
  .from('session_templates')
  .select('*')
  .eq('group_id', groupId)
  .order('created_at', { ascending: false })

if (error) {
  console.error('❌ [usePlanning] Erreur chargement planning athlète:', error.message)
  setSessionTemplates([])
} else {
  console.log('✅ [usePlanning] Templates athlète chargés:', templates?.length || 0)
  setSessionTemplates(templates || [])
}
```

**Avantages**:
- Logs structurés avec emojis pour faciliter le débogage
- Compte des éléments chargés visible
- Traçabilité complète du flow

## Résultats Attendus

### ✅ Workouts
- Chargement correct des séances depuis Supabase
- Pas de timeouts artificiels
- Fallback gracieux si les groupes échouent (charge quand même les workouts personnels)
- Logs clairs dans la console

### ✅ Records
- Chargement direct depuis Supabase sans fallback localStorage
- Erreurs claires et visibles
- Code simplifié et maintenable

### ✅ Planning
- Templates chargés correctement pour coach et athlète
- Logs détaillés pour le débogage
- Gestion propre des erreurs

## Vérifications Post-Correction

### Console Dev Tools
Vous devriez voir:
```
🏋️ [useWorkouts] Début chargement workouts
🏋️ [useWorkouts] Profile role: athlete Selection: undefined
🏋️ [useWorkouts] Chargement pour utilisateur: xxx-xxx-xxx
👥 [useWorkouts] Groupes trouvés: 1
🚀 [useWorkouts] Exécution de la requête...
✅ [useWorkouts] Workouts chargés: 15
✅ [useWorkouts] Chargement terminé

📚 [usePlanning] Chargement planning athlète pour groupe: xxx
✅ [usePlanning] Templates athlète chargés: 5
```

### Network Tab
- Pas de requêtes qui timeout
- Réponses Supabase en < 2s normalement
- Status 200 pour toutes les requêtes

### UI
- Dashboard affiche les séances
- Planning affiche les templates
- Records affiche les performances
- Pas d'écran blanc ou de chargement infini

## Bonnes Pratiques Appliquées

1. **Pas de timeouts artificiels** - Laisse Supabase gérer
2. **Gestion d'erreur propre** - try-catch au lieu de Promise.race
3. **Logs structurés** - Faciles à filtrer et analyser
4. **Fallback gracieux** - Continue avec données partielles si possible
5. **Code simple** - Facile à maintenir et déboguer
6. **Select simple** - `select('*')` au lieu de colonnes explicites

## Si les Problèmes Persistent

1. Vérifier la connexion Supabase dans `.env`
2. Vérifier les RLS policies sur les tables
3. Vérifier les index sur les tables (performance)
4. Vérifier le quota/limits Supabase
5. Regarder les logs Supabase Dashboard

## Notes Techniques

- **Supabase-js v2** gère automatiquement les retries et timeouts
- Les colonnes JSONB sont automatiquement parsées
- `maybeSingle()` est préférable à `single()` pour éviter les erreurs
- Les `.select('*')` incluent toutes les colonnes, y compris JSONB
