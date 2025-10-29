# Guide de Déploiement - Sprintflow

## Prérequis

Avant de déployer, assurez-vous d'avoir:
- Un compte Supabase configuré
- Les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`

## Déploiement sur Netlify

### Option 1: Via l'interface Netlify

1. Connectez-vous à [Netlify](https://app.netlify.com)
2. Cliquez sur "Add new site" > "Import an existing project"
3. Connectez votre repository Git
4. Configuration du build:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Ajoutez les variables d'environnement:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Cliquez sur "Deploy site"

### Option 2: Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod
```

## Déploiement sur Vercel

### Option 1: Via l'interface Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "New Project"
3. Importez votre repository Git
4. Configuration:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Ajoutez les variables d'environnement:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Cliquez sur "Deploy"

### Option 2: Via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel --prod
```

## Déploiement sur d'autres plateformes

Le projet utilise Vite et génère des fichiers statiques dans le dossier `dist/`.
Il peut être déployé sur n'importe quelle plateforme supportant les sites statiques:

- **GitHub Pages**: Utilisez GitHub Actions
- **Firebase Hosting**: `firebase deploy`
- **Cloudflare Pages**: Connectez votre repository
- **AWS S3 + CloudFront**: Uploadez le contenu de `dist/`

## Configuration Post-Déploiement

### 1. Vérifier les variables d'environnement

Assurez-vous que toutes les variables sont correctement définies dans votre plateforme:
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

### 2. Configurer Supabase

1. Dans votre projet Supabase, allez dans **Authentication** > **URL Configuration**
2. Ajoutez votre URL de production dans **Site URL**
3. Ajoutez votre domaine dans **Redirect URLs**

### 3. Tester l'application

Après le déploiement:
1. Vérifiez que l'application se charge correctement
2. Testez la connexion/inscription
3. Vérifiez que les fonctionnalités PWA fonctionnent
4. Testez sur mobile et desktop

## Optimisations

Le build est déjà optimisé avec:
- ✅ Minification activée (Terser)
- ✅ Suppression des console.log en production
- ✅ Code splitting (vendor, charts, supabase, motion)
- ✅ PWA configuré
- ✅ Cache headers optimisés
- ✅ Gzip/Brotli automatique

## Taille du bundle

- **Total**: ~2.6 MB
- **Main bundle (gzipped)**: ~301 KB
- **Charts (gzipped)**: ~92 KB
- **Supabase (gzipped)**: ~32 KB
- **Motion (gzipped)**: ~38 KB

## Dépannage

### L'app ne se charge pas
- Vérifiez les variables d'environnement
- Consultez la console du navigateur (F12)
- Vérifiez que Supabase est accessible

### Erreurs d'authentification
- Vérifiez que l'URL de callback est configurée dans Supabase
- Vérifiez que les politiques RLS sont actives

### PWA ne s'installe pas
- Vérifiez que le site est servi en HTTPS
- Vérifiez que manifest.json est accessible
- Vérifiez que sw.js se charge correctement

## Support

Pour toute question ou problème, consultez:
- Documentation Supabase: https://supabase.com/docs
- Documentation Vite: https://vitejs.dev/
