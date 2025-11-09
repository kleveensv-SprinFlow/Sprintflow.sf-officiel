# Synchronisation des Migrations Supabase - SprintFlow

## 📋 Vue d'ensemble

Ce dépôt contient **83 migrations Supabase** qui doivent être synchronisées avec votre base de données de production pour résoudre les erreurs 400 actuelles liées à la colonne `avatar_url`.

### Migrations Critiques

Deux migrations récentes corrigent un problème important en production :

1. **`20251109065700_remove_avatar_url_column.sql`**
   - Migre les données de `avatar_url` vers `photo_url`
   - Supprime la colonne redondante `avatar_url`

2. **`20251109081835_fix_coach_dashboard_remove_avatar_url.sql`**
   - Met à jour la fonction `get_coach_dashboard_analytics()`
   - Remplace toutes les références `avatar_url` par `photo_url`
   - Résout les erreurs HTTP 400 en production

---

## 🚀 Démarrage Rapide

### Option 1 : Méthode Manuelle (3 commandes)

```bash
# 1. Lier votre projet Supabase
npx supabase link --project-ref kqlzvxfdzandgdkqzggj

# 2. Appliquer les migrations
npx supabase db push

# 3. Vérifier dans le Dashboard
# https://supabase.com/dashboard → Database → Migrations
```

### Option 2 : Script Automatisé (Recommandé)

```bash
# Exécuter le script guidé
./scripts/apply-migrations.sh
```

Le script vous guidera à travers tout le processus avec des vérifications à chaque étape.

---

## 📚 Documentation Disponible

### 1. **DEMARRAGE_RAPIDE_MIGRATION.md**
Pour ceux qui veulent appliquer les migrations rapidement sans lire toute la documentation.
- 3 commandes essentielles
- Tests de base
- Troubleshooting rapide

### 2. **GUIDE_SYNCHRONISATION_MIGRATIONS.md**
Guide complet étape par étape avec explications détaillées.
- Prérequis et préparation
- Liaison avec Supabase
- Application des migrations
- Troubleshooting complet
- Plus de 250 lignes de documentation

### 3. **TESTS_POST_MIGRATION.md**
Checklist exhaustive de tests pour valider les migrations.
- Tests Dashboard Supabase
- Tests locaux (développement)
- Tests en production
- Tests de régression
- Tests SQL directs
- Plus de 600 lignes de tests

### 4. **scripts/apply-migrations.sh**
Script bash automatisé qui :
- Vérifie les prérequis
- Guide la liaison avec Supabase
- Analyse les migrations
- Rappelle de faire une sauvegarde
- Applique les migrations
- Guide les tests post-migration

---

## 🎯 Workflow Recommandé

### Étape 1 : Préparation (5 minutes)

1. **Lisez** `DEMARRAGE_RAPIDE_MIGRATION.md`
2. **Préparez** votre Access Token Supabase
   - Allez sur https://supabase.com/dashboard/account/tokens
   - Générez un nouveau token
3. **Identifiez** votre Project ID (dans votre `.env` ou l'URL du Dashboard)

### Étape 2 : Sauvegarde (2 minutes)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. **Database** → **Backups** → **Create Backup**
4. Attendez la confirmation

### Étape 3 : Application (5-10 minutes)

**Méthode A : Script Automatisé**
```bash
./scripts/apply-migrations.sh
```

**Méthode B : Commandes Manuelles**
```bash
npx supabase link --project-ref kqlzvxfdzandgdkqzggj
npx supabase db push
```

### Étape 4 : Vérification (5 minutes)

1. **Dashboard Supabase**
   - Database → Migrations (tout doit être vert)
   - Table Editor → profiles (vérifier que `avatar_url` n'existe plus)

2. **Tests Locaux**
   ```bash
   npm run dev
   ```
   - Connexion coach
   - Dashboard fonctionne
   - Photos de profil visibles
   - Pas d'erreur 400 dans la console (F12)

3. **Tests Production**
   - Accédez à votre URL de production
   - Testez les mêmes fonctionnalités
   - Vérifiez les logs Supabase

### Étape 5 : Tests Complets (Optionnel, 15-30 minutes)

Suivez `TESTS_POST_MIGRATION.md` pour une validation exhaustive.

---

## ⚠️ Points Importants

### Avant de Commencer

- ✅ Créez une sauvegarde de votre base de données
- ✅ Assurez-vous d'avoir un Access Token valide
- ✅ Vérifiez que vous êtes sur la bonne branche Git
- ✅ Avertissez les autres développeurs si travail en équipe

### Pendant l'Application

- ⏰ Les migrations peuvent prendre quelques minutes
- 📡 Assurez-vous d'avoir une connexion internet stable
- 🚫 N'interrompez pas le processus une fois lancé
- 📝 Notez tout message d'erreur pour le debugging

### Après l'Application

- ✅ Vérifiez que toutes les migrations sont appliquées
- ✅ Testez le dashboard coach en priorité
- ✅ Vérifiez les logs Supabase pour les erreurs
- ✅ Redéployez votre application si du code a changé

---

## 🔍 Vérification Rapide

### Comment savoir si les migrations ont réussi ?

**1. Dans le Dashboard Supabase :**
```
Database → Migrations → Voir 83 migrations dont les 2 récentes ✅
Table Editor → profiles → Colonne 'avatar_url' absente ✅
Table Editor → profiles → Colonne 'photo_url' présente ✅
Database → Logs → Pas d'erreur "avatar_url" ✅
```

**2. Dans votre application :**
```
Console (F12) → Pas d'erreur 400 ✅
Dashboard coach → Photos de profil visibles ✅
Fonctionnalités → Tout fonctionne normalement ✅
```

**3. Test SQL (SQL Editor) :**
```sql
-- Cette requête doit échouer (colonne n'existe plus)
SELECT avatar_url FROM profiles LIMIT 1;
-- Erreur attendue: column "avatar_url" does not exist ✅

-- Cette requête doit réussir
SELECT photo_url FROM profiles WHERE photo_url IS NOT NULL LIMIT 10;
-- Retourne des URLs ✅
```

---

## 🛠️ Troubleshooting Rapide

### Problème : "Invalid access token"
**Solution :** Générez un nouveau token sur https://supabase.com/dashboard/account/tokens

### Problème : "Project not found"
**Solution :** Vérifiez votre Project ID dans le Dashboard Supabase ou dans `.env`

### Problème : Erreurs 400 persistent
**Solution :**
```bash
# Chercher les références à avatar_url dans le code
grep -r "avatar_url" src/
# Remplacer par photo_url et redéployer
```

### Problème : Photos ne s'affichent pas
**Solution :**
1. Vérifiez les permissions Storage : Dashboard → Storage → profiles
2. Vérifiez que les données ont été migrées :
   ```sql
   SELECT COUNT(*) FROM profiles WHERE photo_url IS NOT NULL;
   ```

---

## 📊 Statistiques du Projet

- **Nombre total de migrations :** 83
- **Migrations critiques :** 2
- **Tables affectées :** profiles, et autres via get_coach_dashboard_analytics()
- **Fonctions affectées :** get_coach_dashboard_analytics()
- **Colonnes supprimées :** avatar_url
- **Colonnes utilisées :** photo_url

---

## 📞 Support

### Ressources Locales
- **Guide Complet :** `GUIDE_SYNCHRONISATION_MIGRATIONS.md`
- **Tests :** `TESTS_POST_MIGRATION.md`
- **Script :** `scripts/apply-migrations.sh`
- **Configuration Production :** `CONFIGURATION_PRODUCTION.md`

### Ressources Externes
- **Documentation Supabase CLI :** https://supabase.com/docs/guides/cli
- **Documentation Migrations :** https://supabase.com/docs/guides/database/migrations
- **Support Supabase :** https://supabase.com/support

### En cas de problème critique
1. Consultez les logs : Dashboard → Database → Logs
2. Restaurez la sauvegarde si nécessaire : Dashboard → Database → Backups
3. Consultez la section Troubleshooting de `GUIDE_SYNCHRONISATION_MIGRATIONS.md`

---

## ✅ Checklist de Réussite

Cochez ces éléments pour confirmer que tout fonctionne :

- [ ] Les 83 migrations sont appliquées dans le Dashboard
- [ ] La colonne `avatar_url` n'existe plus dans `profiles`
- [ ] La colonne `photo_url` contient les données migrées
- [ ] La fonction `get_coach_dashboard_analytics` utilise `photo_url`
- [ ] Aucune erreur 400 dans les logs Supabase
- [ ] L'application locale fonctionne sans erreur
- [ ] L'application en production fonctionne
- [ ] Le dashboard coach affiche les photos de profil
- [ ] Les tests de régression passent
- [ ] L'équipe est informée des changements

---

## 🎉 Félicitations !

Une fois toutes les migrations appliquées et testées, votre application SprintFlow sera :
- ✅ Débarrassée des erreurs 400 liées à `avatar_url`
- ✅ Alignée entre le code local et la base de données de production
- ✅ Plus maintenable avec une seule colonne pour les photos de profil
- ✅ Prête pour le déploiement en production

---

**Date de création :** 9 novembre 2025
**Version du projet :** 2.0.0
**Dernière migration :** 20251109081835
