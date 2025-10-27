# 🔍 Guide de Débogage - Sauvegarde de Séance

## ✅ PROBLÈME RÉSOLU !

**Erreur corrigée** : "operator does not exist: text ->> unknown"

**Cause** : Le trigger `trigger_analyser_seance()` essayait d'accéder à `request.headers` qui n'existe pas dans Supabase, causant une erreur de conversion de type.

**Solution appliquée** :
- ✅ Fonction trigger corrigée avec gestion d'erreur robuste
- ✅ Suppression de l'accès à `request.headers`
- ✅ Le trigger ne bloque plus les insertions en cas d'erreur
- ✅ Test d'insertion réussi dans Supabase

**Vous pouvez maintenant sauvegarder vos entraînements !**

---

## 📋 Checklist de Débogage

### 1. Ouvrir la Console du Navigateur
- Appuyez sur **F12** ou **Ctrl+Shift+I** (Windows/Linux)
- Appuyez sur **Cmd+Option+I** (Mac)
- Allez dans l'onglet **Console**

### 2. Logs à Vérifier

Quand vous cliquez sur "Sauvegarder", vous devriez voir dans la console :

```
💾 Sauvegarde séance...
{
  user_id: "...",
  date: "2024-10-24",
  tag_seance: "vitesse_max",
  courses_json: [...],
  ...
}

🟢 handleWorkoutSave appelé dans App.tsx

➕ Mode création nouvelle séance

🔵 useWorkouts.saveWorkout appelé

📤 Envoi à Supabase...

✅ Données reçues de Supabase:
{ id: "...", ... }

🔄 État workouts mis à jour: X séances

✅ Sauvegarde complète réussie!

✅ Séance sauvegardée avec succès!

✅ Sauvegarde terminée, changement de vue...

📊 WorkoutsList render - workouts: X séances
```

### 3. Cas d'Erreur

#### ❌ Si vous voyez une ERREUR :

**Erreur "Utilisateur non connecté"** :
```
❌ Erreur: Utilisateur non connecté
```
→ Solution : Déconnectez-vous et reconnectez-vous

**Erreur Supabase** :
```
❌ Erreur Supabase: { code: "...", message: "..." }
```
→ Vérifiez le message d'erreur
→ Possibles causes :
  - RLS policy (permissions)
  - Champ manquant
  - Type de données incorrect

**Pas de données retournées** :
```
❌ Aucune donnée retournée
```
→ Problème avec le `.select()` après insert

### 4. Vérifier dans Supabase

1. Allez sur https://supabase.com
2. Sélectionnez votre projet
3. Table Editor → workouts
4. Vérifiez si une nouvelle ligne apparaît

### 5. Tests à Faire

#### Test 1 : Séance Minimale
- Date : aujourd'hui
- Type de séance : vitesse_max
- Aucune course, aucun exercice
- Cliquez "Sauvegarder"
- Vérifiez les logs

#### Test 2 : Séance avec 1 Course
- Date : aujourd'hui
- Type de séance : vitesse_max
- 1 course : 60m, 6.85s, Manuel, Piste, Pointes
- Cliquez "Sauvegarder"
- Vérifiez les logs

#### Test 3 : Séance avec 1 Exercice
- Date : aujourd'hui
- Type de séance : musculation
- 1 exercice : Squat, 5 séries, 5 reps, 100kg
- Cliquez "Sauvegarder"
- Vérifiez les logs

### 6. Vérifier LocalStorage

Si Supabase échoue, les données sont sauvegardées localement :

1. Dans la console du navigateur
2. Onglet **Application** (Chrome) ou **Storage** (Firefox)
3. Local Storage → votre domaine
4. Cherchez la clé `workouts_[votre-user-id]`

### 7. Commandes de Debug Manuel

Dans la console du navigateur, vous pouvez taper :

```javascript
// Voir les workouts en mémoire
console.log(workouts)

// Vérifier l'utilisateur
console.log(user)

// Tester une requête Supabase
const { data, error } = await supabase
  .from('workouts')
  .select('*')
  .limit(5);
console.log('Workouts DB:', data, error);
```

## 🚨 Problèmes Courants

### Le bouton ne fait rien
- Vérifiez qu'il n'y a pas d'erreur JavaScript dans la console
- Vérifiez que le tag_seance est bien sélectionné (obligatoire)

### L'alert ne s'affiche pas
- Le formulaire n'appelle pas handleSubmit
- Vérifiez que le bouton est de type="submit"
- Vérifiez qu'il n'y a pas d'erreur avant l'alert

### Les données n'apparaissent pas dans le calendrier
- Vérifiez que le format de date est correct (YYYY-MM-DD)
- Vérifiez que workouts.length augmente dans les logs
- Vérifiez que vous êtes sur la bonne vue (calendar ou list)

### Les données disparaissent au refresh
- Supabase n'a pas sauvegardé (erreur RLS ou autre)
- Vérifiez localStorage
- Vérifiez la table workouts dans Supabase

## 📞 Que Faire Ensuite ?

1. **Testez** en suivant ce guide
2. **Notez** les logs que vous voyez dans la console
3. **Copiez** les messages d'erreur exactement
4. **Partagez** ces informations pour obtenir de l'aide

## 🎯 Ce qui a été ajouté

✅ Alerts de succès/erreur visibles
✅ Logs détaillés à chaque étape
✅ Tous les champs requis envoyés
✅ Gestion d'erreur améliorée
✅ Backup localStorage automatique
