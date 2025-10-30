# Configuration pour la Production - Sprintflow

## ⚠️ IMPORTANT: Problème "Failed to Fetch" sur Mobile

Si vous avez l'erreur "failed to fetch" sur mobile mais que ça fonctionne en local, suivez **EXACTEMENT** ces étapes:

---

## 📋 CHECKLIST AVANT PUBLICATION

### ✅ 1. Configuration des Variables d'Environnement

**Sur votre plateforme de déploiement (Netlify/Vercel):**

Ajoutez ces **2 variables d'environnement** EXACTEMENT comme suit:

```
VITE_SUPABASE_URL=https://kqlzvxfdzandgdkqzggj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxbHp2eGZkemFuZGdka3F6Z2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTM2ODcsImV4cCI6MjA3NzIyOTY4N30.sOpb5fL1l7-yli2_Lrptz_L7ihGkZxzbGSoW2tYRn_E
```

#### Sur Netlify:
1. Allez dans **Site settings** → **Environment variables**
2. Cliquez sur **Add a variable**
3. Ajoutez les 2 variables ci-dessus
4. **Redéployez** votre site

#### Sur Vercel:
1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez les 2 variables ci-dessus
3. Cochez **Production**, **Preview**, et **Development**
4. **Redéployez** votre projet

---

### ✅ 2. Configuration Supabase (CRITIQUE)

**C'est LA cause la plus fréquente du "failed to fetch"!**

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet: **kqlzvxfdzandgdkqzggj**
3. Allez dans **Authentication** → **URL Configuration**

#### A. Site URL
Mettez l'URL de votre app déployée:
```
https://votre-app.netlify.app
```
ou
```
https://votre-app.vercel.app
```

#### B. Redirect URLs (TRÈS IMPORTANT)
Ajoutez **TOUTES** ces URLs dans la liste:

```
http://localhost:5173/**
http://localhost:4173/**
https://votre-app.netlify.app/**
https://votre-app.vercel.app/**
https://votre-app.netlify.app/auth/confirm
https://votre-app.vercel.app/auth/confirm
```

**⚠️ Remplacez `votre-app` par le vrai nom de votre application!**

#### C. Additional Redirect URLs (Optionnel pour mobile)
Si vous utilisez un custom domain:
```
https://votre-domaine.com/**
https://votre-domaine.com/auth/confirm
```

---

### ✅ 3. Configuration CORS dans Supabase

1. Dans Supabase, allez dans **Settings** → **API**
2. Vérifiez que **CORS** est activé
3. Dans **Additional CORS origins**, ajoutez:

```
https://votre-app.netlify.app
https://votre-app.vercel.app
```

---

### ✅ 4. Vérifier le Build

Avant de publier, vérifiez que le build fonctionne:

```bash
npm run build
```

Si vous voyez des erreurs, corrigez-les avant de publier!

---

## 🔍 DIAGNOSTIC DES PROBLÈMES

### Erreur: "Failed to fetch" sur mobile uniquement

**Causes possibles:**

1. ❌ **Variables d'environnement manquantes** (le plus fréquent)
   - Solution: Vérifiez qu'elles sont bien ajoutées sur votre plateforme

2. ❌ **URL de redirection manquante dans Supabase** (très fréquent)
   - Solution: Ajoutez l'URL de votre app dans Authentication → URL Configuration

3. ❌ **CORS non configuré**
   - Solution: Ajoutez votre domaine dans Supabase Settings → API

4. ❌ **HTTPS pas activé**
   - Solution: Vérifiez que votre site est bien en HTTPS (automatique sur Netlify/Vercel)

### Comment vérifier?

#### A. Vérifier les variables d'environnement
Ajoutez temporairement ce code dans `src/App.tsx` (à supprimer après):

```typescript
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has ANON_KEY:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Publiez et ouvrez la console sur mobile (avec inspect sur Chrome mobile).

#### B. Vérifier les erreurs réseau
1. Ouvrez votre app sur mobile
2. Connectez votre téléphone en USB
3. Allez sur `chrome://inspect` (Chrome desktop)
4. Inspectez votre app mobile
5. Regardez l'onglet **Network** lors de l'inscription

---

## 🎯 GUIDE PAS À PAS - Netlify

### Étape 1: Connexion à Netlify
```bash
npm install -g netlify-cli
netlify login
```

### Étape 2: Déploiement
```bash
netlify deploy --prod
```

### Étape 3: Variables d'environnement
1. Allez sur https://app.netlify.com
2. Cliquez sur votre site
3. **Site settings** → **Environment variables**
4. Ajoutez:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Étape 4: Redéploiement
```bash
netlify deploy --prod
```

### Étape 5: Configuration Supabase
1. Copiez l'URL de votre site (ex: `https://mon-app.netlify.app`)
2. Allez sur Supabase → Authentication → URL Configuration
3. Ajoutez l'URL dans **Redirect URLs**:
   ```
   https://mon-app.netlify.app/**
   ```

---

## 🎯 GUIDE PAS À PAS - Vercel

### Étape 1: Connexion à Vercel
```bash
npm install -g vercel
vercel login
```

### Étape 2: Déploiement
```bash
vercel --prod
```

### Étape 3: Variables d'environnement
1. Allez sur https://vercel.com
2. Cliquez sur votre projet
3. **Settings** → **Environment Variables**
4. Ajoutez:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Cochez **Production**, **Preview**, **Development**

### Étape 4: Redéploiement
```bash
vercel --prod
```

### Étape 5: Configuration Supabase
1. Copiez l'URL de votre site (ex: `https://mon-app.vercel.app`)
2. Allez sur Supabase → Authentication → URL Configuration
3. Ajoutez l'URL dans **Redirect URLs**:
   ```
   https://mon-app.vercel.app/**
   ```

---

## 📱 TEST FINAL

### Checklist de test:

1. ✅ Ouvrir l'app sur mobile (Chrome/Safari)
2. ✅ Essayer de s'inscrire avec un nouvel email
3. ✅ Vérifier qu'on reçoit l'email de confirmation
4. ✅ Cliquer sur le lien de confirmation
5. ✅ Se connecter avec les identifiants
6. ✅ Vérifier que l'app fonctionne normalement

### Si ça ne marche toujours pas:

1. Vérifiez **3 fois** les variables d'environnement
2. Vérifiez **3 fois** les Redirect URLs dans Supabase
3. Attendez 5 minutes (propagation du cache)
4. Videz le cache du navigateur mobile
5. Testez en navigation privée

---

## 🆘 SUPPORT

### Logs utiles pour déboguer:

```bash
# Sur votre plateforme de déploiement
netlify logs  # ou
vercel logs

# Dans la console navigateur mobile
chrome://inspect
```

### Informations à vérifier:

- ✅ Les variables d'environnement sont-elles bien définies?
- ✅ L'URL de l'app est-elle dans les Redirect URLs Supabase?
- ✅ Le site est-il en HTTPS?
- ✅ Les CORS sont-ils configurés dans Supabase?

---

## ✅ RÉCAPITULATIF

Pour que l'app fonctionne sur mobile:

1. **Variables d'environnement** sur votre plateforme ✅
2. **Redirect URLs** dans Supabase ✅
3. **CORS** configuré dans Supabase ✅
4. **HTTPS** activé (automatique) ✅
5. **Redéploiement** après chaque changement ✅

**Une fois ces 5 étapes complétées, ça DOIT fonctionner!**
