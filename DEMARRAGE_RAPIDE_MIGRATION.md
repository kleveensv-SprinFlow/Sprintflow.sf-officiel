# Démarrage Rapide - Synchronisation des Migrations

## Pour les pressés : 3 commandes

Si vous connaissez déjà Supabase et que vous voulez juste appliquer les migrations rapidement :

```bash
# 1. Lier votre projet (remplacez par votre Project ID)
npx supabase link --project-ref kqlzvxfdzandgdkqzggj

# 2. Appliquer les migrations
npx supabase db push

# 3. Vérifier
# Allez sur https://supabase.com/dashboard → Database → Migrations
```

**Votre Access Token :** Générez-le sur https://supabase.com/dashboard/account/tokens

---

## Méthode Assistée : Script Automatique

Si vous préférez un processus guidé avec vérifications :

```bash
# Exécuter le script d'application
./scripts/apply-migrations.sh
```

Le script va :
- ✅ Vérifier les prérequis
- ✅ Vous guider pour la liaison avec Supabase
- ✅ Analyser les migrations à appliquer
- ✅ Vous rappeler de faire une sauvegarde
- ✅ Appliquer les migrations
- ✅ Vous guider dans les tests post-migration

---

## Ce qui va être appliqué

**83 migrations** au total, dont 2 critiques récentes :

1. **20251109065700_remove_avatar_url_column.sql**
   - Copie les données de `avatar_url` vers `photo_url`
   - Supprime la colonne redondante `avatar_url`

2. **20251109081835_fix_coach_dashboard_remove_avatar_url.sql**
   - Corrige la fonction `get_coach_dashboard_analytics()`
   - Remplace `avatar_url` par `photo_url`
   - Résout les erreurs 400 en production

---

## Après l'application

### Tests Essentiels

1. **Dashboard Supabase**
   - Database → Migrations (vérifier que tout est appliqué)
   - Table Editor → profiles (vérifier que `avatar_url` n'existe plus)

2. **Application Locale**
   ```bash
   npm run dev
   ```
   - Connectez-vous en tant que coach
   - Vérifiez que les photos de profil s'affichent
   - Ouvrez la console (F12) : pas d'erreur 400

3. **Application Production**
   - Accédez à votre URL de production
   - Testez le dashboard coach
   - Vérifiez que tout fonctionne

### Si Problème

**Erreur "avatar_url does not exist" :**
```bash
# Chercher les références dans le code
grep -r "avatar_url" src/

# Remplacer par photo_url et redéployer
```

**Photos ne s'affichent pas :**
- Vérifiez les permissions Storage dans Supabase
- Vérifiez que les données ont été migrées :
  ```sql
  SELECT COUNT(*) FROM profiles WHERE photo_url IS NOT NULL;
  ```

---

## Documentation Complète

Pour plus de détails :
- **Guide complet :** `GUIDE_SYNCHRONISATION_MIGRATIONS.md`
- **Tests détaillés :** `TESTS_POST_MIGRATION.md`
- **Script d'application :** `scripts/apply-migrations.sh`

---

## Timeline Estimée

- Liaison du projet : **2 minutes**
- Application des migrations : **2-5 minutes**
- Tests basiques : **5 minutes**
- Tests complets : **15-30 minutes**

**Total : 10-40 minutes** selon le niveau de tests souhaité

---

## Support

En cas de problème :
1. Consultez `GUIDE_SYNCHRONISATION_MIGRATIONS.md` (section Troubleshooting)
2. Consultez `TESTS_POST_MIGRATION.md` (section "Que faire en cas de problème ?")
3. Logs Supabase : Dashboard → Database → Logs
