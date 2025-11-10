# 🚨 ÉTAPES DE RÉSOLUTION - À SUIVRE DANS L'ORDRE

## 📋 Étape 1 : Vérifier l'état actuel

1. Aller sur : https://supabase.com/dashboard/project/kqlzvxfdzandgdkqzggj/editor/sql
2. Créer une nouvelle requête
3. Copier-coller le contenu de **`VERIFIER_MIGRATION.sql`**
4. Cliquer "Run"
5. Noter le résultat :
   - Combien d'index ? (attendu: 6)
   - La fonction existe ? (attendu: oui)
   - Policy status ? (attendu: OPTIMISÉE ✅)

## 📋 Étape 2 : Appliquer le fix complet

**Si l'étape 1 montre des résultats incorrects** :

1. Créer une NOUVELLE requête dans Supabase
2. Copier-coller TOUT le contenu de **`FIX_FINAL_COMPLET.sql`**
3. Cliquer "Run"
4. Attendre 10-15 secondes
5. Vérifier le résultat (devrait montrer 6 index)

## 📋 Étape 3 : Vérifier à nouveau

1. Re-exécuter **`VERIFIER_MIGRATION.sql`**
2. Vérifier que TOUT est OK :
   - ✅ 6 index
   - ✅ fonction can_read_profile existe
   - ✅ 1 policy avec status "OPTIMISÉE ✅"

## 📋 Étape 4 : Tester l'application

1. Retourner sur l'application
2. Vider le cache : Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
3. Ouvrir la console (F12)
4. Se connecter
5. Observer les logs

### ✅ Résultat attendu

```
🚀 [useAuth] Initialisation
🔄 [useAuth] Chargement du profil pour: ...
✅ [useAuth] Profil chargé: { ... } ← En < 1 seconde
🏋️ [useWorkouts] Début chargement workouts
✅ [useWorkouts] Workouts chargés: 15
```

**Plus de timeouts !**

### ❌ Si ça ne marche toujours pas

Exécuter **`TEST_SANS_RLS.sql`** pour confirmer que c'est bien les policies le problème.

Si l'app devient rapide après avoir désactivé RLS, alors :
- Le problème vient bien des policies
- Il faut vérifier que `FIX_FINAL_COMPLET.sql` a bien été exécuté
- Réactiver RLS après le test : `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`

---

## 🔍 Checklist de débogage

- [ ] Étape 1 exécutée
- [ ] Résultat étape 1 : ____ index, fonction _____, policy _____
- [ ] FIX_FINAL_COMPLET.sql exécuté
- [ ] Étape 3 vérification OK
- [ ] Application testée avec cache vidé
- [ ] Résultat : ⏱️ temps de chargement = _____ secondes

**Si tout est coché et que ça ne marche toujours pas, il y a un autre problème !**
