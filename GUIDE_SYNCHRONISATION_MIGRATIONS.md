# Guide de Synchronisation des Migrations Supabase vers la Production

## Vue d'ensemble

Ce guide vous accompagne étape par étape pour appliquer vos migrations locales Supabase vers votre base de données de production. Votre projet contient actuellement **83 fichiers de migration** qui doivent être synchronisés.

## Migrations Critiques Récentes

Les deux dernières migrations sont particulièrement importantes car elles corrigent un problème en production :

1. **20251109065700_remove_avatar_url_column.sql**
   - Copie les données de `avatar_url` vers `photo_url`
   - Supprime la colonne redondante `avatar_url`

2. **20251109081835_fix_coach_dashboard_remove_avatar_url.sql**
   - Corrige la fonction `get_coach_dashboard_analytics()`
   - Remplace toutes les références `avatar_url` par `photo_url`
   - Résout les erreurs 400 en production

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ Node.js version 18 ou supérieure installé
- ✅ npm version 9 ou supérieure installé
- ✅ Un accès à votre compte Supabase
- ✅ Les droits d'administration sur le projet Supabase
- ✅ Une connexion internet stable

## Étape 1 : Préparer l'environnement

### 1.1 Vérifier votre position dans le projet

Ouvrez un terminal et naviguez vers la racine de votre projet SprintFlow :

```bash
cd /chemin/vers/votre/projet/sprintflow
```

Vérifiez que vous êtes bien au bon endroit :

```bash
ls -la
```

Vous devriez voir les fichiers : `package.json`, `supabase/`, `src/`, etc.

### 1.2 Vérifier l'installation du CLI Supabase

Le CLI Supabase est déjà installé dans votre projet (voir `package.json`). Vérifiez qu'il est accessible :

```bash
npx supabase --version
```

Vous devriez voir quelque chose comme : `1.x.x` ou supérieur.

## Étape 2 : Récupérer vos identifiants Supabase

### 2.1 Trouver votre Project ID

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Connectez-vous à votre compte
3. Cliquez sur votre projet **SprintFlow**
4. Dans l'URL de votre navigateur, vous verrez :
   ```
   https://supabase.com/dashboard/project/VOTRE_PROJECT_ID
   ```

5. **VOTRE_PROJECT_ID** est visible aussi dans votre `.env` :
   ```
   VITE_SUPABASE_URL=https://kqlzvxfdzandgdkqzggj.supabase.co
   ```
   Dans cet exemple, le Project ID est : `kqlzvxfdzandgdkqzggj`

### 2.2 Générer un Access Token

⚠️ **ATTENTION** : Ce token donne un accès complet à votre compte Supabase. Ne le partagez JAMAIS avec personne.

1. Allez sur [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Cliquez sur **"Generate New Token"**
3. Donnez-lui un nom descriptif : `CLI SprintFlow Migration Nov 2025`
4. Cliquez sur **"Generate Token"**
5. **COPIEZ immédiatement** ce token quelque part en sécurité
6. ⚠️ Vous ne pourrez plus le revoir après avoir quitté cette page

## Étape 3 : Lier votre projet local avec Supabase

### 3.1 Exécuter la commande de liaison

Dans votre terminal, à la racine du projet, exécutez :

```bash
npx supabase link --project-ref kqlzvxfdzandgdkqzggj
```

**Remplacez `kqlzvxfdzandgdkqzggj` par votre véritable Project ID si différent.**

### 3.2 Fournir l'Access Token

Le terminal vous demandera :

```
Enter your access token:
```

Collez le token que vous avez généré à l'étape 2.2, puis appuyez sur **Entrée**.

### 3.3 Confirmation

Si tout se passe bien, vous verrez un message de succès :

```
Finished supabase link.
```

Votre projet local est maintenant lié à votre projet Supabase de production !

## Étape 4 : Analyser les migrations à appliquer

Avant d'appliquer les migrations, vous pouvez vérifier lesquelles ne sont pas encore appliquées en production.

### 4.1 Lister les migrations en attente

```bash
npx supabase db diff --linked
```

Cette commande va comparer votre schéma local avec celui de production et vous montrer les différences.

### 4.2 Examiner les migrations locales

Vous pouvez consulter la liste de toutes vos migrations :

```bash
ls -1 supabase/migrations/
```

Vous devriez voir 83 fichiers, dont les deux plus récents :
- `20251109065700_remove_avatar_url_column.sql`
- `20251109081835_fix_coach_dashboard_remove_avatar_url.sql`

## Étape 5 : Appliquer les migrations en production

⚠️ **MOMENT CRITIQUE** : Cette étape va modifier votre base de données de production.

### 5.1 Créer une sauvegarde (RECOMMANDÉ)

Avant d'appliquer les migrations, créez une sauvegarde de votre base de données :

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Database** → **Backups**
4. Cliquez sur **"Create Backup"**
5. Attendez que la sauvegarde soit complétée

### 5.2 Appliquer les migrations

Une fois la sauvegarde créée, exécutez :

```bash
npx supabase db push
```

### 5.3 Surveillance de l'application

Le terminal va vous montrer :

1. **La liste des migrations à appliquer**
   ```
   Applying migration 20251109065700_remove_avatar_url_column.sql...
   Applying migration 20251109081835_fix_coach_dashboard_remove_avatar_url.sql...
   ```

2. **Le statut de chaque migration**
   - ✅ Un message de succès pour chaque migration appliquée
   - ❌ Un message d'erreur si une migration échoue

3. **Le résumé final**
   ```
   Finished supabase db push.
   ```

### 5.4 En cas d'erreur

Si vous rencontrez une erreur pendant l'application :

1. **Lisez attentivement le message d'erreur**
   - Il indique généralement quelle migration a échoué et pourquoi

2. **Causes communes d'erreurs** :
   - Une colonne existe déjà
   - Une fonction existe déjà
   - Une contrainte est violée
   - Un conflit de données

3. **Solutions possibles** :
   - Si une colonne/fonction existe déjà, la migration peut être ignorée (elle est déjà appliquée)
   - Si c'est un conflit de données, vous devrez peut-être ajuster la migration
   - Consultez les logs dans le Dashboard Supabase → Database → Logs

## Étape 6 : Vérifier que les migrations ont été appliquées

### 6.1 Vérifier via le Dashboard Supabase

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Database** → **Migrations**
4. Vous devriez voir toutes vos migrations listées, y compris les deux plus récentes

### 6.2 Vérifier la structure de la table `profiles`

1. Dans le Dashboard, allez dans **Table Editor**
2. Sélectionnez la table `profiles`
3. Vérifiez que :
   - ✅ La colonne `photo_url` existe
   - ✅ La colonne `avatar_url` n'existe PLUS
   - ✅ Les données ont été préservées dans `photo_url`

### 6.3 Vérifier la fonction `get_coach_dashboard_analytics`

1. Dans le Dashboard, allez dans **Database** → **Functions**
2. Recherchez `get_coach_dashboard_analytics`
3. Cliquez dessus pour voir sa définition
4. Vérifiez que toutes les références utilisent `photo_url` et non `avatar_url`

## Étape 7 : Tester votre application

### 7.1 Tests locaux

Avant de tester en production, testez localement :

```bash
npm run dev
```

1. Connectez-vous en tant que coach
2. Accédez au Dashboard coach
3. Vérifiez que les photos de profil des athlètes s'affichent correctement
4. Vérifiez qu'il n'y a pas d'erreurs 400 dans la console du navigateur (F12)

### 7.2 Tests en production

1. Accédez à votre application déployée
2. Connectez-vous en tant que coach
3. Testez les mêmes fonctionnalités qu'en local
4. Vérifiez que tout fonctionne normalement

### 7.3 Vérifier les erreurs dans Supabase

1. Allez dans **Database** → **Logs**
2. Regardez s'il y a des erreurs récentes
3. Si vous voyez des erreurs 400 liées à `avatar_url`, c'est qu'une requête utilise encore l'ancienne colonne

## Étape 8 : Redéployer votre application (si nécessaire)

Si vous avez modifié du code frontend qui référençait `avatar_url`, vous devez redéployer :

### Sur Netlify :
```bash
netlify deploy --prod
```

### Sur Vercel :
```bash
vercel --prod
```

### Via Git (recommandé) :
```bash
git add .
git commit -m "Sync migrations with production - fix avatar_url to photo_url"
git push origin main
```

Votre plateforme de déploiement détectera le commit et redéploiera automatiquement.

## Récapitulatif des commandes

Voici toutes les commandes dans l'ordre :

```bash
# 1. Vérifier l'installation
npx supabase --version

# 2. Lier le projet (remplacez par votre Project ID)
npx supabase link --project-ref kqlzvxfdzandgdkqzggj

# 3. (Optionnel) Analyser les différences
npx supabase db diff --linked

# 4. Appliquer les migrations
npx supabase db push
```

## Troubleshooting (Résolution de problèmes)

### Problème : "Invalid access token"

**Cause** : Le token est expiré ou incorrect

**Solution** :
1. Générez un nouveau token sur [https://supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Réessayez la commande `npx supabase link`

### Problème : "Project not found"

**Cause** : Le Project ID est incorrect

**Solution** :
1. Vérifiez votre Project ID dans l'URL du Dashboard Supabase
2. Ou vérifiez dans votre fichier `.env` : `VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co`

### Problème : "Migration already applied"

**Cause** : Une migration a déjà été appliquée manuellement ou par un autre développeur

**Solution** :
- C'est normal, la migration sera ignorée
- Supabase garde une trace des migrations déjà appliquées et ne les réapplique pas

### Problème : Erreurs 400 persistent après migration

**Cause** : Le code frontend utilise encore `avatar_url`

**Solution** :
1. Recherchez dans votre code : `grep -r "avatar_url" src/`
2. Remplacez toutes les occurrences par `photo_url`
3. Redéployez votre application

### Problème : "Column avatar_url does not exist"

**Cause** : La migration a bien été appliquée et la colonne est supprimée

**Solution** :
- Ceci confirme que la migration a fonctionné
- Vérifiez que votre code n'utilise plus `avatar_url`
- Redéployez si nécessaire

## Informations Importantes

### Structure des migrations

Vos migrations sont dans : `supabase/migrations/`

Format des noms de fichiers :
```
YYYYMMDDHHMMSS_description.sql
```

Exemple :
```
20251109081835_fix_coach_dashboard_remove_avatar_url.sql
```

### Migrations appliquées

Supabase garde une trace des migrations dans la table `supabase_migrations.schema_migrations`.

Pour voir les migrations appliquées, vous pouvez exécuter dans le SQL Editor du Dashboard :

```sql
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 10;
```

### Ordre d'application

Les migrations sont appliquées dans l'ordre chronologique basé sur le timestamp dans le nom du fichier.

## Support et Aide

### Logs Supabase
- Dashboard → Database → Logs

### Logs de votre application
- Netlify : `netlify logs`
- Vercel : `vercel logs`

### Documentation Supabase
- [https://supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
- [https://supabase.com/docs/guides/database/migrations](https://supabase.com/docs/guides/database/migrations)

## Checklist Finale

Après avoir terminé, vérifiez que :

- ✅ La commande `npx supabase db push` a réussi sans erreurs
- ✅ La colonne `avatar_url` a été supprimée de la table `profiles`
- ✅ La colonne `photo_url` contient les données
- ✅ La fonction `get_coach_dashboard_analytics()` utilise `photo_url`
- ✅ L'application fonctionne normalement en production
- ✅ Il n'y a plus d'erreurs 400 dans les logs
- ✅ Les photos de profil s'affichent correctement

## Félicitations !

Vous avez réussi à synchroniser vos migrations locales avec votre base de données Supabase de production. Votre application devrait maintenant fonctionner sans erreurs liées à `avatar_url`.

---

**Date de création** : 9 novembre 2025
**Version du projet** : 2.0.0
**Nombre de migrations** : 83
