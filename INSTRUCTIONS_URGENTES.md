# 🚨 INSTRUCTIONS URGENTES - À FAIRE MAINTENANT

## ⏱️ Temps estimé : 2 minutes

## Problème actuel
- ⚠️ Le profil timeout après 15 secondes
- ❌ Les plannings ne se chargent jamais (timeout workouts)
- ❌ L'application est très lente

## ✅ Solution immédiate

### Étape 1 : Ouvrir Supabase SQL Editor
1. Aller sur : https://supabase.com/dashboard/project/kqlzvxfdzandgdkqzggj/editor/sql
2. Se connecter si nécessaire

### Étape 2 : Créer une nouvelle requête
1. Cliquer sur "New query" (bouton vert en haut à droite)

### Étape 3 : Copier-coller le script
Copier TOUT le contenu de MIGRATION_RAPIDE.sql dans l'éditeur.

### Étape 4 : Exécuter
1. Cliquer sur "Run" (ou Ctrl+Enter)
2. Attendre 5-10 secondes
3. Vérifier qu'il y a **6 lignes** dans les résultats

### Étape 5 : Rafraîchir l'application
1. Retourner sur l'application
2. Appuyer sur F5 pour rafraîchir
3. Se reconnecter si nécessaire

## ✅ Résultat attendu

Dans la console du navigateur (F12), vous devriez voir :

```
🚀 [useAuth] Initialisation de l'authentification
✅ [useAuth] Profil chargé (< 1 seconde)
✅ [useWorkouts] Workouts chargés: 15
✅ [Dashboard] Chargement terminé
```

**Temps total : < 5 secondes** (au lieu de 15+ actuellement)

---

**C'EST LA SEULE ÉTAPE MANQUANTE !**
