# Guide de Déploiement

## Problème Résolu : Détection de Secrets

Le déploiement échouait car Netlify détectait une clé API Google en dur dans le code. Ce problème a été résolu.

## Changements Appliqués

### 1. Suppression des Secrets en Dur
- ✅ Supprimé la clé API Google codée en dur dans `supabase/functions/sprinty-brain/index.ts`
- ✅ Toutes les clés API utilisent maintenant des variables d'environnement
- ✅ La recherche Google est maintenant optionnelle (ne s'exécute que si les clés sont configurées)

### 2. Fichiers Créés
- `NETLIFY_SECRETS.md` - Documentation sur la configuration des secrets
- `DEPLOYMENT_GUIDE.md` - Ce guide de déploiement

## Comment Redéployer

### Option 1 : Déploiement Automatique (Recommandé)
Si votre projet est connecté à Git et que le déploiement automatique est activé :
1. Committez les changements
2. Poussez vers votre branche principale
3. Netlify redéploiera automatiquement

### Option 2 : Déploiement Manuel via Netlify CLI
```bash
# Installer Netlify CLI (si ce n'est pas déjà fait)
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

### Option 3 : Déploiement via Dashboard Netlify
1. Allez dans votre site sur https://app.netlify.com
2. Cliquez sur **Deploys** > **Trigger deploy** > **Deploy site**

## Configuration des Variables d'Environnement

### Dans Netlify (Déjà configuré)
Ces variables sont déjà configurées dans Netlify :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `NODE_VERSION`

### Dans Supabase (Pour Edge Functions)
Les Edge Functions nécessitent leurs propres secrets. Configurez-les dans Supabase :

```bash
# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref VOTRE_PROJECT_REF

# Configurer les secrets
supabase secrets set MISTRAL_API_KEY=votre_cle_mistral

# (Optionnel) Pour activer la recherche Google dans sprinty-brain
supabase secrets set GOOGLE_SEARCH_KEY=votre_cle_google
supabase secrets set GOOGLE_SEARCH_CX=votre_cx_google
```

## Vérification du Déploiement

Après le déploiement, vérifiez que :
1. ✅ Le build est réussi (pas d'erreur "secrets detected")
2. ✅ L'application se charge correctement
3. ✅ Les fonctionnalités principales fonctionnent
4. ✅ Les Edge Functions fonctionnent (si configurées)

## En Cas d'Erreur

### Erreur : "Secrets scanning found secrets in build"
- Vérifiez qu'aucune clé API n'est codée en dur dans le code
- Assurez-vous que tous les secrets utilisent `Deno.env.get()`
- Vérifiez le fichier `.gitignore` pour exclure `.env`

### Erreur : "MISTRAL_API_KEY not set"
- Configurez la clé dans Supabase (pas dans Netlify)
- Utilisez `supabase secrets set MISTRAL_API_KEY=votre_cle`

### Erreur : "Functions bundling" warning
- C'est un avertissement sans gravité
- Les Edge Functions sont hébergées sur Supabase, pas sur Netlify

## Statut des Corrections de Sécurité

✅ **Tous les problèmes de sécurité ont été corrigés** :
- Index manquants pour les clés étrangères : **Corrigé**
- Politiques RLS non optimisées : **Corrigé**
- Politiques RLS en double : **Corrigé**
- Secrets en dur dans le code : **Corrigé**

## Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs de déploiement Netlify
2. Vérifiez les logs des Edge Functions dans Supabase
3. Consultez `NETLIFY_SECRETS.md` pour la configuration des secrets
