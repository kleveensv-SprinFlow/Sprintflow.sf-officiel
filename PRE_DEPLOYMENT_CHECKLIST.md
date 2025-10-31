# ✅ Checklist Pré-Déploiement Vercel

## Problèmes corrigés

### ✅ 1. Imports et dépendances
- [x] Supprimé imports de composants inexistants (`BodyCompCharts`, `BodyCompForm`, `AdvicePanel`)
- [x] Corrigé `useBodycomp` → `useBodyComposition`
- [x] Supprimé extensions `.ts` des imports
- [x] Ajouté support `userId` au hook `useBodyComposition`
- [x] Ajouté export `lastWeight` dans `useBodyComposition`

### ✅ 2. Fichiers binaires (placeholders valides)
- [x] PNG valides (1x1 transparent) : `logo sans fond.png`, `image.png`, etc.
- [x] MP4 valides (vidéos minimales) : tous les fichiers dans `public/videos/`
- [x] Taille totale du build : 2.6 MB

### ✅ 3. Configuration build
- [x] `base: '/'` dans `vite.config.ts` (requis pour Vercel)
- [x] Node.js version spécifiée : `>=18.0.0` dans `package.json`
- [x] Build command : `npm run build`
- [x] Output directory : `dist`
- [x] Code splitting optimisé (vendor, charts, utils, supabase, motion)

### ✅ 4. Variables d'environnement
- [x] `.env.example` présent
- [x] Fallbacks sécurisés dans `supabase.ts`
- [x] Documentation complète dans `VERCEL_DEPLOYMENT.md`

### ✅ 5. Authentification sécurisée
- [x] Déconnexion automatique si profil introuvable
- [x] Nettoyage localStorage/sessionStorage
- [x] Affichage erreurs sur page connexion
- [x] Vérification email confirmé

### ✅ 6. Configuration Vercel
- [x] `vercel.json` avec routes SPA et headers sécurité
- [x] Rewrites pour Single Page Application
- [x] Headers CSP, X-Frame-Options, etc.
- [x] Cache optimisé pour assets

### ✅ 7. Edge Functions (Supabase)
- [x] 10 fonctions configurées correctement
- [x] CORS headers sur toutes les fonctions
- [x] Imports `npm:` et `jsr:` corrects
- [x] Pas de dépendances croisées

### ✅ 8. Nettoyage
- [x] Pas de `console.log` en production (supprimés par Terser)
- [x] Pas de fichiers `.sh` dans public/
- [x] `.gitignore` à jour
- [x] Pas d'URLs hardcodées localhost

### ✅ 9. PWA
- [x] Service worker généré
- [x] Manifest configuré
- [x] Cache stratégies définies
- [x] Icons configurés

### ✅ 10. Tests
- [x] Build réussit : `npm run build` ✓
- [x] Pas d'erreurs TypeScript
- [x] Pas de dépendances manquantes
- [x] Taille chunks acceptable (~2.6 MB total)

---

## À faire sur Vercel

### 1. Variables d'environnement
Ajouter dans les paramètres du projet :
```
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon
```

### 2. Configuration Supabase
Dans Authentication > URL Configuration :
- Site URL: `https://votre-app.vercel.app`
- Redirect URLs: `https://votre-app.vercel.app/**`

### 3. Déploiement
```bash
# Option 1: Via dashboard Vercel
1. Connecter le repository Git
2. Vercel détecte automatiquement Vite
3. Ajouter les variables d'environnement
4. Déployer

# Option 2: Via CLI
npm install -g vercel
vercel login
vercel --prod
```

---

## Tests post-déploiement

- [ ] Application se charge
- [ ] Connexion Supabase fonctionne
- [ ] Authentification fonctionne
- [ ] Routes SPA fonctionnent (pas de 404)
- [ ] Assets statiques chargent
- [ ] PWA installable
- [ ] Edge Functions accessibles

---

## Optimisations futures

### Performance
- [ ] Lazy loading des routes avec React.lazy()
- [ ] Compression Brotli sur Vercel (déjà activé par défaut)
- [ ] Image optimization avec Vercel Image API
- [ ] Remplacer vidéos placeholder par vraies vidéos optimisées

### Sécurité
- [ ] Ajouter rate limiting sur Edge Functions
- [ ] Configurer CSP plus strict
- [ ] Activer Vercel Analytics
- [ ] Configurer Vercel Speed Insights

### Monitoring
- [ ] Configurer Sentry pour error tracking
- [ ] Activer Vercel Web Analytics
- [ ] Configurer alertes Supabase

---

## Commandes utiles

```bash
# Build local
npm run build

# Preview du build
npm run preview

# Vérifier taille du build
du -sh dist/

# Test en local avec variables d'environnement
cp .env.example .env
# Éditer .env avec vos vraies valeurs
npm run dev
```

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev
- **Supabase Docs**: https://supabase.com/docs
- **Guide déploiement complet**: Voir `VERCEL_DEPLOYMENT.md`
