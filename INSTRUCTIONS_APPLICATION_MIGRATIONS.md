# Instructions Étape par Étape pour Appliquer les Migrations

## 🎯 Ce que vous devez faire MAINTENANT

Je ne peux pas appliquer les migrations moi-même car cela nécessite votre authentification Supabase personnelle. Mais voici exactement ce que vous devez faire :

---

## Étape 1 : Ouvrir votre Terminal

**Sur Windows :**
- Appuyez sur `Win + R`
- Tapez `cmd` ou `powershell`
- Appuyez sur Entrée

**Sur Mac/Linux :**
- Appuyez sur `Cmd + Space` (Mac) ou `Ctrl + Alt + T` (Linux)
- Tapez `terminal`
- Appuyez sur Entrée

---

## Étape 2 : Naviguer vers votre projet

Dans le terminal, tapez (remplacez par le vrai chemin de votre projet) :

```bash
cd /chemin/vers/votre/projet/sprintflow
```

**Pour trouver le chemin :**
- Windows : Ouvrez l'explorateur de fichiers dans votre projet, cliquez sur la barre d'adresse et copiez
- Mac : Faites un clic droit sur le dossier du projet, maintenez `Option`, cliquez sur "Copier comme chemin"

Vérifiez que vous êtes au bon endroit :
```bash
ls -la
```

Vous devriez voir : `package.json`, `supabase/`, `src/`, etc.

---

## Étape 3 : Générer votre Access Token Supabase

1. **Ouvrez votre navigateur**
2. **Allez sur :** https://supabase.com/dashboard/account/tokens
3. **Connectez-vous** si nécessaire
4. **Cliquez sur** "Generate New Token"
5. **Donnez un nom :** `CLI SprintFlow Migration`
6. **Cliquez sur** "Generate Token"
7. **COPIEZ immédiatement le token** (vous ne pourrez plus le revoir)

⚠️ **IMPORTANT :** Gardez ce token secret, ne le partagez avec personne, pas même moi.

---

## Étape 4 : Lier votre projet avec Supabase

Dans votre terminal (toujours dans le dossier du projet), exécutez :

```bash
npx supabase link --project-ref kqlzvxfdzandgdkqzggj
```

**Ce qui va se passer :**
1. Le terminal va télécharger le CLI Supabase (si première fois)
2. Il va vous demander : `Enter your access token:`
3. **COLLEZ** le token que vous avez copié à l'étape 3
4. **Appuyez sur Entrée**

**Résultat attendu :**
```
Finished supabase link.
```

✅ Si vous voyez ce message, c'est bon, passez à l'étape suivante !

❌ Si vous voyez une erreur :
- "Invalid access token" → Regénérez un nouveau token et réessayez
- "Project not found" → Vérifiez le Project ID dans votre `.env`

---

## Étape 5 : Appliquer les migrations

Maintenant que votre projet est lié, exécutez :

```bash
npx supabase db push
```

**Ce qui va se passer :**
1. Le CLI va analyser vos 83 migrations locales
2. Il va comparer avec votre base de données de production
3. Il va afficher la liste des migrations à appliquer
4. Il va les appliquer une par une

**Pendant l'exécution, vous verrez :**
```
Applying migration 20251029220000_complete_schema.sql...
Applying migration 20251029230000_security_performance_fixes.sql...
...
Applying migration 20251109065700_remove_avatar_url_column.sql...
Applying migration 20251109081835_fix_coach_dashboard_remove_avatar_url.sql...
```

**Cela peut prendre 2-5 minutes.**

**Résultat attendu :**
```
Finished supabase db push.
```

✅ Si vous voyez ce message, **FÉLICITATIONS !** Les migrations sont appliquées !

❌ Si vous voyez une erreur, **COPIEZ** le message d'erreur complet et dites-le moi.

---

## Étape 6 : Vérifier que tout a fonctionné

### Vérification 1 : Dashboard Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur **Database** → **Migrations**
4. Vous devriez voir **83 migrations** dont les 2 récentes en haut

### Vérification 2 : Table profiles

1. Dans le Dashboard, cliquez sur **Table Editor**
2. Sélectionnez la table **profiles**
3. Regardez les colonnes :
   - ✅ `photo_url` doit exister
   - ✅ `avatar_url` ne doit PLUS exister

Si `avatar_url` existe encore, les migrations n'ont pas été appliquées.

### Vérification 3 : Fonction get_coach_dashboard_analytics

1. Dans le Dashboard, cliquez sur **Database** → **Functions**
2. Cherchez **get_coach_dashboard_analytics**
3. Cliquez dessus
4. Vérifiez que vous voyez `photo_url` et NON `avatar_url` dans le code

---

## Étape 7 : Tester votre application

### Test Local

Dans votre terminal :
```bash
npm run dev
```

1. Ouvrez http://localhost:5173
2. Connectez-vous en tant que coach
3. Ouvrez la console du navigateur (F12)
4. Allez sur le dashboard coach

**À vérifier :**
- [ ] Le dashboard se charge sans erreur
- [ ] Les photos de profil des athlètes s'affichent
- [ ] Aucune erreur 400 dans la console
- [ ] Aucun message mentionnant "avatar_url"

### Test Production

1. Allez sur votre URL de production (ex: https://votre-app.netlify.app)
2. Connectez-vous en tant que coach
3. Ouvrez la console (F12)
4. Testez les mêmes choses que localement

---

## 🎉 C'est Terminé !

Si toutes les vérifications passent :
- ✅ Les migrations sont appliquées
- ✅ Le problème `avatar_url` est résolu
- ✅ Votre application fonctionne correctement

---

## ❌ En cas de problème

### Erreur pendant `npx supabase link`

**Erreur : "Invalid access token"**
- Regénérez un nouveau token
- Réessayez la commande

**Erreur : "Project not found"**
- Vérifiez votre Project ID dans `.env` :
  ```bash
  cat .env
  ```
- Utilisez le bon ID dans la commande `link`

### Erreur pendant `npx supabase db push`

**Erreur : "column already exists"**
- Certaines migrations sont déjà appliquées
- C'est normal, elles seront ignorées
- Continuez

**Erreur : "constraint violation"**
- Une migration a un problème avec les données existantes
- **COPIEZ** l'erreur complète
- Dites-moi l'erreur, je vous aiderai

### Photos ne s'affichent pas

**Dans le Dashboard Supabase :**
1. Allez dans **Storage** → **profiles**
2. Vérifiez les policies (permissions)
3. Assurez-vous que la lecture publique est activée

**Dans le SQL Editor :**
```sql
SELECT COUNT(*) FROM profiles WHERE photo_url IS NOT NULL;
```
Si le résultat est 0, les données n'ont pas été migrées.

---

## 📞 Besoin d'aide ?

Si vous bloquez à une étape :

1. **COPIEZ** exactement le message d'erreur que vous voyez
2. **DITES-MOI** à quelle étape vous êtes bloqué
3. Je vous aiderai à résoudre le problème

**Informations utiles à me donner :**
- À quelle étape vous êtes (1-7)
- Le message d'erreur complet
- Ce que vous voyez dans le terminal
- Des captures d'écran si possible

---

## 📚 Documentation Complète

Si vous voulez plus de détails :
- **Guide complet :** `GUIDE_SYNCHRONISATION_MIGRATIONS.md`
- **Tests détaillés :** `TESTS_POST_MIGRATION.md`
- **Vue d'ensemble :** `README_MIGRATION_SUPABASE.md`

---

**Vous êtes prêt !** Commencez par l'Étape 1 et suivez les instructions une par une.
