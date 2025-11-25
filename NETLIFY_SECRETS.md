# Configuration des Secrets Netlify

## Variables d'environnement requises

Pour déployer sur Netlify, vous devez configurer les variables d'environnement suivantes dans les paramètres Netlify :

### Variables obligatoires (déjà configurées)
- `VITE_SUPABASE_URL` - URL de votre projet Supabase
- `VITE_SUPABASE_ANON_KEY` - Clé anonyme publique de Supabase

### Variables pour Supabase Edge Functions (à configurer dans Supabase)

Les Edge Functions nécessitent leurs propres secrets, qui doivent être configurés dans Supabase (pas dans Netlify) :

1. **MISTRAL_API_KEY** (requis pour sprinty-brain)
   - Obtenez une clé API sur https://console.mistral.ai/
   - Commande : `supabase secrets set MISTRAL_API_KEY=votre_cle`

2. **GOOGLE_SEARCH_KEY** (optionnel pour sprinty-brain)
   - Clé API Google Custom Search
   - Obtenez-la sur https://developers.google.com/custom-search/v1/overview
   - Commande : `supabase secrets set GOOGLE_SEARCH_KEY=votre_cle`

3. **GOOGLE_SEARCH_CX** (optionnel pour sprinty-brain)
   - ID du moteur de recherche personnalisé Google
   - Créez-le sur https://programmablesearchengine.google.com/
   - Commande : `supabase secrets set GOOGLE_SEARCH_CX=votre_cx`

## Configuration dans Netlify

1. Allez dans **Site settings** > **Environment variables**
2. Ajoutez les variables `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`
3. Redéployez le site

## Configuration dans Supabase

```bash
# Installer Supabase CLI (si ce n'est pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier le projet
supabase link --project-ref votre-project-ref

# Définir les secrets
supabase secrets set MISTRAL_API_KEY=votre_cle_mistral
supabase secrets set GOOGLE_SEARCH_KEY=votre_cle_google
supabase secrets set GOOGLE_SEARCH_CX=votre_cx_google
```

## Note de sécurité

⚠️ **Ne committez JAMAIS de clés API ou secrets dans le code source !**

- Tous les secrets doivent être dans des variables d'environnement
- Le fichier `.env` est dans `.gitignore` et ne doit jamais être commité
- Les clés en dur dans le code déclencheront un échec de déploiement sur Netlify
