# ⚡ DÉMARRAGE RAPIDE - FIX EN 2 MINUTES

## 🎯 Problème identifié

Votre diagnostic montre :
- ✅ 6 index OK
- ✅ Fonction OK
- ❌ **3 POLICIES au lieu d'1 !**

Les 2 policies lentes ralentissent tout, même si la policy optimisée existe.

## ✅ Solution (30 secondes)

### Copier-coller ce script dans Supabase SQL Editor :

```sql
-- Supprimer les 2 policies lentes
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can read their athletes profiles" ON profiles;

-- Vérifier le résultat
SELECT policyname FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'SELECT';
```

**Résultat attendu** : 1 seule ligne ("Users can read accessible profiles")

## 🚀 Ensuite

1. Rafraîchir l'app avec Ctrl+Shift+R
2. Observer la console (F12)
3. Temps de chargement devrait être < 5 secondes

---

**OU utilisez le fichier** : `FIX_SUPPRIMER_POLICIES_LENTES.sql`
