# 🚨 README URGENT - PROBLÈME DE TIMEOUT

## 🎯 Problème

L'application prend 15+ secondes à charger et affiche :
- ⚠️ Timeout profil 15s
- ⚠️ Timeout groupes 5s
- ❌ Timeout workouts 10s

## ✅ Solution

**3 fichiers SQL à exécuter dans l'ordre** :

### 1️⃣ VERIFIER_MIGRATION.sql
👉 **À exécuter EN PREMIER pour diagnostiquer**

Copier-coller dans Supabase SQL Editor et exécuter.

**Résultat attendu** :
- 6 index
- 1 fonction (can_read_profile)
- 1 policy status "OPTIMISÉE ✅"

### 2️⃣ FIX_FINAL_COMPLET.sql
👉 **À exécuter SI l'étape 1 montre des problèmes**

Copier-coller TOUT le contenu et exécuter.

Ce script :
- ✅ Crée 6 index
- ✅ Crée la fonction can_read_profile()
- ✅ Remplace les policies lentes par une policy optimisée

### 3️⃣ TEST_SANS_RLS.sql (optionnel)
👉 **À exécuter SEULEMENT si ça ne marche toujours pas**

Désactive temporairement RLS pour confirmer que c'est bien le problème.

⚠️ **ATTENTION** : Réactiver RLS après le test !

## 📋 Guide détaillé

Voir **`ETAPES_RESOLUTION.md`** pour le guide complet étape par étape.

## 🔍 Fichiers de diagnostic

- `DIAGNOSTIC_POLICIES.sql` - Voir l'état des policies
- `VERIFIER_MIGRATION.sql` - Vérifier que tout est OK

## ⏱️ Temps attendu après fix

| Opération | Avant | Après |
|-----------|-------|-------|
| Profil | 15s timeout | < 500ms |
| Groupes | 5s timeout | < 200ms |
| Workouts | 10s timeout | < 2s |
| **Total** | **30s+** | **< 5s** |

---

## 🚀 Action immédiate

1. Ouvrir : https://supabase.com/dashboard/project/kqlzvxfdzandgdkqzggj/editor/sql
2. Exécuter **VERIFIER_MIGRATION.sql**
3. Si résultat incorrect, exécuter **FIX_FINAL_COMPLET.sql**
4. Vider le cache navigateur (Ctrl+Shift+R)
5. Tester l'application

**Durée totale : 5 minutes maximum** ⏱️
