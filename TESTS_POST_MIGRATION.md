# Tests Post-Migration - Guide Complet

## Vue d'ensemble

Après avoir appliqué les migrations Supabase, il est crucial de vérifier que toutes les fonctionnalités de votre application SprintFlow continuent de fonctionner correctement, en particulier celles affectées par le changement de `avatar_url` vers `photo_url`.

## Migrations Appliquées à Tester

1. **20251109065700_remove_avatar_url_column.sql**
   - Suppression de la colonne `avatar_url`
   - Migration des données vers `photo_url`

2. **20251109081835_fix_coach_dashboard_remove_avatar_url.sql**
   - Correction de la fonction `get_coach_dashboard_analytics()`
   - Remplacement de `avatar_url` par `photo_url`

## Checklist de Tests

### ✅ Phase 1 : Vérifications dans le Dashboard Supabase

#### 1.1 Vérifier la structure de la table `profiles`

1. Connectez-vous à [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **SprintFlow**
3. Allez dans **Table Editor**
4. Sélectionnez la table `profiles`

**Vérifications :**
- [ ] La colonne `photo_url` existe et est de type `text` ou `varchar`
- [ ] La colonne `avatar_url` n'existe PLUS (doit être supprimée)
- [ ] Les données dans `photo_url` ne sont pas NULL pour les utilisateurs qui avaient un avatar
- [ ] Au moins quelques enregistrements ont des URLs valides dans `photo_url`

**Commande SQL pour vérifier :**
```sql
-- Compter les profils avec photo_url
SELECT
  COUNT(*) as total_profiles,
  COUNT(photo_url) as profiles_with_photo,
  COUNT(photo_url) * 100.0 / COUNT(*) as percentage
FROM profiles;
```

**Résultat attendu :**
- Total doit correspondre au nombre d'utilisateurs
- Les utilisateurs qui avaient un avatar doivent avoir leur `photo_url` rempli

#### 1.2 Vérifier les migrations appliquées

1. Dans le Dashboard, allez dans **Database** → **Migrations**
2. Cherchez les deux migrations récentes

**Vérifications :**
- [ ] `20251109065700_remove_avatar_url_column` est marquée comme appliquée
- [ ] `20251109081835_fix_coach_dashboard_remove_avatar_url` est marquée comme appliquée
- [ ] Aucune erreur n'est affichée pour ces migrations

#### 1.3 Vérifier la fonction `get_coach_dashboard_analytics`

1. Allez dans **Database** → **Functions**
2. Recherchez `get_coach_dashboard_analytics`
3. Cliquez dessus pour voir sa définition

**Vérifications :**
- [ ] La fonction existe
- [ ] Toutes les références à `avatar_url` ont été remplacées par `photo_url`
- [ ] Ligne 89 : `p.photo_url` (pas `avatar_url`)
- [ ] Ligne 104 : `p.photo_url` (pas `avatar_url`)

**Commande SQL pour tester la fonction :**
```sql
-- Tester la fonction (nécessite d'être connecté en tant que coach)
SELECT get_coach_dashboard_analytics();
```

**Résultat attendu :**
- Un objet JSON valide est retourné
- Pas d'erreur mentionnant `avatar_url`
- Les champs `pendingWellness` et `pendingValidation` contiennent `photo_url` (pas `avatar_url`)

#### 1.4 Vérifier les logs d'erreurs

1. Allez dans **Database** → **Logs**
2. Consultez les logs récents (dernières 24h)

**Vérifications :**
- [ ] Aucune erreur mentionnant `column "avatar_url" does not exist`
- [ ] Aucune erreur 400 liée à des requêtes sur `profiles`
- [ ] Les requêtes sur `get_coach_dashboard_analytics` réussissent

### ✅ Phase 2 : Tests Locaux (Environnement de Développement)

#### 2.1 Démarrer l'application en local

```bash
cd /chemin/vers/votre/projet
npm run dev
```

**Vérifications :**
- [ ] L'application démarre sans erreurs
- [ ] Pas d'erreurs dans le terminal
- [ ] L'URL locale s'affiche (généralement http://localhost:5173)

#### 2.2 Tests d'authentification

**Test 1 : Connexion d'un utilisateur existant**
1. Ouvrez votre navigateur et allez sur http://localhost:5173
2. Connectez-vous avec un compte existant (coach ou athlète)

**Vérifications :**
- [ ] La connexion fonctionne
- [ ] Pas d'erreur 400 dans la console (F12 → Console)
- [ ] Le profil de l'utilisateur se charge correctement

**Test 2 : Inscription d'un nouvel utilisateur**
1. Déconnectez-vous
2. Créez un nouveau compte

**Vérifications :**
- [ ] L'inscription fonctionne
- [ ] L'email de confirmation est envoyé (si activé)
- [ ] Le profil est créé dans la table `profiles`
- [ ] La colonne `photo_url` est NULL (normal pour un nouveau compte)

#### 2.3 Tests du Dashboard Coach

**Prérequis :** Connectez-vous en tant que coach ayant des athlètes assignés

**Test 1 : Affichage du dashboard**
1. Accédez au dashboard coach
2. Ouvrez la console du navigateur (F12 → Console)

**Vérifications :**
- [ ] Le dashboard se charge sans erreur
- [ ] Aucune erreur 400 n'apparaît dans la console
- [ ] Aucun message d'erreur mentionnant `avatar_url`
- [ ] Les widgets se chargent (Team Health, Actions, etc.)

**Test 2 : Photos de profil des athlètes**
1. Regardez la liste des athlètes
2. Vérifiez les photos de profil

**Vérifications :**
- [ ] Les photos de profil s'affichent pour les athlètes qui en ont une
- [ ] Les avatars par défaut s'affichent pour ceux qui n'ont pas de photo
- [ ] Pas d'images cassées (broken images)
- [ ] Les initiales s'affichent si pas de photo

**Test 3 : Widget "Pending Wellness"**
1. Vérifiez le widget affichant les athlètes n'ayant pas rempli leur wellness

**Vérifications :**
- [ ] Les cartes d'athlètes s'affichent correctement
- [ ] Les photos de profil sont visibles
- [ ] Pas d'erreur dans la console

**Test 4 : Widget "Pending Validation"**
1. Vérifiez le widget affichant les séances à valider

**Vérifications :**
- [ ] Les séances s'affichent
- [ ] Les photos des athlètes sont visibles
- [ ] Cliquer sur une séance fonctionne

**Test 5 : Détail d'un athlète**
1. Cliquez sur un athlète pour voir ses détails
2. Ouvrez la console (F12)

**Vérifications :**
- [ ] La page de détail se charge
- [ ] La photo de profil de l'athlète s'affiche en haut
- [ ] Pas d'erreur 400 dans la console
- [ ] Les données de l'athlète se chargent (wellness, workouts, etc.)

#### 2.4 Tests du Profil Utilisateur

**Test 1 : Affichage du profil**
1. Allez dans votre profil (icône utilisateur ou menu)
2. Ouvrez la console (F12)

**Vérifications :**
- [ ] Le profil se charge sans erreur
- [ ] La photo de profil s'affiche (si vous en avez une)
- [ ] Sinon, l'avatar par défaut ou les initiales s'affichent
- [ ] Pas d'erreur dans la console

**Test 2 : Upload d'une nouvelle photo de profil**
1. Cliquez sur "Modifier le profil" ou l'icône d'édition
2. Uploadez une nouvelle photo
3. Sauvegardez

**Vérifications :**
- [ ] L'upload fonctionne
- [ ] La nouvelle photo s'affiche immédiatement
- [ ] Pas d'erreur dans la console
- [ ] En rafraîchissant la page, la photo est toujours là

**Test 3 : Vérifier dans la base de données**
1. Retournez dans le Dashboard Supabase → Table Editor → profiles
2. Trouvez votre profil

**Vérifications :**
- [ ] La colonne `photo_url` contient l'URL de votre nouvelle photo
- [ ] La colonne `avatar_url` n'existe plus (pas dans les colonnes)

#### 2.5 Tests des Groupes et Chat

**Test 1 : Liste des groupes**
1. Allez dans la section Groupes
2. Ouvrez la console (F12)

**Vérifications :**
- [ ] Les groupes se chargent
- [ ] Les photos de profil des membres s'affichent
- [ ] Pas d'erreur dans la console

**Test 2 : Chat de groupe**
1. Ouvrez un chat de groupe
2. Regardez les photos des participants

**Vérifications :**
- [ ] Les messages se chargent
- [ ] Les photos de profil des participants s'affichent à côté de leurs messages
- [ ] Pas d'erreur dans la console

### ✅ Phase 3 : Tests en Production

**IMPORTANT :** Ne testez en production qu'après avoir validé tous les tests locaux.

#### 3.1 Accéder à l'application en production

1. Ouvrez votre navigateur
2. Allez sur votre URL de production (ex: https://votre-app.netlify.app)
3. Ouvrez immédiatement la console (F12 → Console)

**Vérifications :**
- [ ] L'application se charge
- [ ] Pas d'erreur 400 au chargement
- [ ] Pas d'erreur mentionnant `avatar_url`

#### 3.2 Répéter les tests du Dashboard Coach

Répétez tous les tests de la Phase 2.3 en production :

- [ ] Dashboard coach se charge
- [ ] Photos de profil des athlètes visibles
- [ ] Widget "Pending Wellness" fonctionne
- [ ] Widget "Pending Validation" fonctionne
- [ ] Détail d'un athlète fonctionne
- [ ] Aucune erreur 400 dans la console

#### 3.3 Tests sur Mobile

**Test sur iPhone/Safari**
1. Ouvrez votre app sur iPhone avec Safari
2. Pour voir la console : connectez l'iPhone à un Mac, ouvrez Safari → Develop

**Vérifications :**
- [ ] L'app se charge
- [ ] Dashboard coach fonctionne
- [ ] Photos de profil visibles
- [ ] Pas d'erreur dans la console

**Test sur Android/Chrome**
1. Ouvrez votre app sur Android avec Chrome
2. Pour voir la console : connectez en USB, allez sur chrome://inspect

**Vérifications :**
- [ ] L'app se charge
- [ ] Dashboard coach fonctionne
- [ ] Photos de profil visibles
- [ ] Pas d'erreur dans la console

#### 3.4 Tests de Performance

**Test 1 : Temps de chargement du dashboard**
1. Ouvrez la console (F12 → Network)
2. Rechargez le dashboard coach
3. Regardez le temps de chargement de la requête à `get_coach_dashboard_analytics`

**Vérifications :**
- [ ] La requête réussit (status 200)
- [ ] Le temps de réponse est raisonnable (< 2 secondes)
- [ ] Pas de timeout

**Test 2 : Appels API**
1. Dans la console, onglet Network
2. Filtrez sur "Fetch/XHR"
3. Naviguez dans l'application

**Vérifications :**
- [ ] Toutes les requêtes à Supabase réussissent (status 200 ou 201)
- [ ] Aucune requête ne mentionne `avatar_url` dans les paramètres
- [ ] Pas d'erreur 400 liée à `column does not exist`

### ✅ Phase 4 : Tests de Régression

Ces tests vérifient que les autres fonctionnalités n'ont pas été cassées par les migrations.

#### 4.1 Tests de Création de Workout

1. Créez une nouvelle séance d'entraînement
2. Assignez-la à un athlète (si coach)
3. Sauvegardez

**Vérifications :**
- [ ] La création fonctionne
- [ ] La séance apparaît dans la liste
- [ ] Pas d'erreur liée aux profils

#### 4.2 Tests de Wellness Log

1. Remplissez un formulaire de wellness
2. Sauvegardez

**Vérifications :**
- [ ] La sauvegarde fonctionne
- [ ] Les données apparaissent dans les charts
- [ ] Le coach peut voir les données de wellness

#### 4.3 Tests de Nutrition

1. Ajoutez un repas
2. Enregistrez

**Vérifications :**
- [ ] L'ajout fonctionne
- [ ] Les données s'affichent dans le dashboard nutrition

#### 4.4 Tests de Records

1. Ajoutez un nouveau record
2. Sauvegardez

**Vérifications :**
- [ ] Le record est enregistré
- [ ] Il apparaît dans la liste des records

### ✅ Phase 5 : Tests SQL Directs

Pour les utilisateurs avancés, exécutez ces requêtes dans le SQL Editor du Dashboard Supabase.

#### 5.1 Vérifier l'absence de références à avatar_url

```sql
-- Cette requête devrait échouer car la colonne n'existe plus
SELECT avatar_url FROM profiles LIMIT 1;
-- Erreur attendue: column "avatar_url" does not exist
```

**Résultat attendu :** Erreur confirmant que la colonne n'existe plus.

#### 5.2 Vérifier que photo_url contient les données

```sql
-- Vérifier les profils avec photo
SELECT
  id,
  full_name,
  photo_url,
  created_at
FROM profiles
WHERE photo_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

**Résultat attendu :** Une liste de profils avec leurs URLs de photo.

#### 5.3 Tester la fonction get_coach_dashboard_analytics

```sql
-- Exécuter la fonction (nécessite d'être connecté en tant que coach)
SELECT get_coach_dashboard_analytics();
```

**Résultat attendu :**
- Un objet JSON contenant `teamHealth` et `priorityActions`
- Les objets dans `pendingWellness` et `pendingValidation` contiennent `photo_url`
- Pas d'erreur

#### 5.4 Vérifier les permissions RLS

```sql
-- Vérifier que les policies sur profiles fonctionnent
SELECT * FROM profiles WHERE id = auth.uid();
```

**Résultat attendu :**
- Votre profil est retourné
- La colonne `photo_url` est présente
- Pas de colonne `avatar_url`

### ✅ Phase 6 : Checklist Finale

Avant de considérer la migration comme réussie, vérifiez :

#### Dans le Dashboard Supabase
- [ ] Les migrations sont marquées comme appliquées
- [ ] La colonne `avatar_url` n'existe plus dans `profiles`
- [ ] La colonne `photo_url` contient les données migrées
- [ ] La fonction `get_coach_dashboard_analytics` utilise `photo_url`
- [ ] Aucune erreur dans les logs récents

#### Tests Locaux
- [ ] L'application démarre sans erreur
- [ ] Dashboard coach fonctionne
- [ ] Photos de profil s'affichent
- [ ] Upload de photo fonctionne
- [ ] Aucune erreur 400 dans la console

#### Tests Production
- [ ] L'application se charge
- [ ] Dashboard coach fonctionne
- [ ] Tests sur mobile réussis
- [ ] Pas d'erreur 400
- [ ] Performance correcte

#### Tests de Régression
- [ ] Création de workout fonctionne
- [ ] Wellness log fonctionne
- [ ] Nutrition fonctionne
- [ ] Records fonctionnent

## Que faire en cas de problème ?

### Problème : Erreur "column avatar_url does not exist"

**Cause :** Du code frontend utilise encore `avatar_url`

**Solution :**
1. Cherchez dans votre code : `grep -r "avatar_url" src/`
2. Remplacez toutes les occurrences par `photo_url`
3. Redéployez l'application

**Fichiers à vérifier en priorité :**
- `src/hooks/useProfile.ts`
- `src/hooks/useCoachDashboard.ts`
- `src/components/coach/`
- `src/components/profile/`
- `src/components/common/Avatar.tsx`

### Problème : Photos de profil ne s'affichent pas

**Causes possibles :**
1. Les données n'ont pas été migrées correctement
2. Les permissions sur le bucket Storage sont incorrectes

**Solutions :**

**Vérifier la migration des données :**
```sql
SELECT
  COUNT(*) FILTER (WHERE photo_url IS NOT NULL) as with_photo,
  COUNT(*) as total
FROM profiles;
```

**Vérifier les permissions Storage :**
1. Dashboard → Storage → profiles
2. Vérifiez que les policies permettent la lecture publique

### Problème : Fonction get_coach_dashboard_analytics retourne une erreur

**Cause :** La fonction n'a pas été mise à jour ou il y a un autre problème

**Solution :**

**Vérifier la version de la fonction :**
```sql
SELECT routine_definition
FROM information_schema.routines
WHERE routine_name = 'get_coach_dashboard_analytics';
```

Cherchez `photo_url` dans la définition. S'il y a encore `avatar_url`, la migration n'a pas été appliquée.

**Réappliquer manuellement la migration :**
```sql
-- Copiez tout le contenu de :
-- supabase/migrations/20251109081835_fix_coach_dashboard_remove_avatar_url.sql
-- Et exécutez-le dans le SQL Editor
```

### Problème : Certaines photos ont disparu

**Cause :** La migration a écrasé des données existantes

**Solution :**

**Vérifier si une sauvegarde existe :**
1. Dashboard → Database → Backups
2. Restaurez la dernière sauvegarde avant la migration

**Si pas de sauvegarde :** Les données dans `avatar_url` ont normalement été copiées vers `photo_url` avant la suppression. Vérifiez :
```sql
-- Regarder les logs de la migration
SELECT * FROM supabase_migrations.schema_migrations
WHERE version = '20251109065700'
ORDER BY created_at DESC;
```

## Documentation Supplémentaire

- **Guide de Synchronisation :** `GUIDE_SYNCHRONISATION_MIGRATIONS.md`
- **Script d'Application :** `scripts/apply-migrations.sh`
- **Documentation Supabase :** https://supabase.com/docs/guides/database/migrations

## Support

Si vous rencontrez des problèmes non couverts par ce guide :

1. Consultez les logs Supabase : Dashboard → Database → Logs
2. Consultez la console du navigateur (F12 → Console)
3. Vérifiez les migrations appliquées : Dashboard → Database → Migrations
4. Contactez le support Supabase si nécessaire

---

**Date de création :** 9 novembre 2025
**Version du projet :** 2.0.0
**Migrations testées :** 20251109065700, 20251109081835
