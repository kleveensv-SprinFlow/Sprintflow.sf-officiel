# Guide de Migration : Héberger SprintFlow sur Netlify (Gratuit & Pro)

Ce guide vous permet de publier votre application sur Netlify. Cela résout deux problèmes :
1.  **Suppression du bandeau "Made in Bolt"** : Vous aurez votre propre site propre.
2.  **Mises à jour fiables** : Netlify gère parfaitement le cache (avec la configuration que j'ai ajoutée).
3.  **Gratuit** : L'offre "Starter" de Netlify est gratuite et suffisante pour votre projet.

---

## Étape 1 : Créer un compte Netlify (si vous n'en avez pas)

1.  Allez sur [netlify.com](https://www.netlify.com/).
2.  Cliquez sur **Sign up**.
3.  Choisissez **Sign up with GitHub**. C'est important pour la liaison automatique.

## Étape 2 : Connecter votre projet GitHub

1.  Une fois connecté sur Netlify, cliquez sur le bouton **"Add new site"** > **"Import an existing project"**.
2.  Choisissez **GitHub**.
3.  Une fenêtre va s'ouvrir pour autoriser Netlify à accéder à vos dépôts. Acceptez.
4.  Dans la liste de vos projets GitHub, sélectionnez votre projet **SprintFlow** (le dépôt actuel).

## Étape 3 : Configurer le déploiement (C'est automatique !)

Netlify va détecter automatiquement que c'est un projet Vite/React grâce au fichier `netlify.toml` que j'ai configuré.

Vérifiez juste que les champs ressemblent à ceci (normalement pré-remplis) :
*   **Build command :** `npm run build`
*   **Publish directory :** `dist`

Cliquez sur **Deploy site**.

## Étape 4 : Configurer les Variables d'Environnement (CRUCIAL)

Pour que l'application puisse parler à Supabase (votre base de données), vous devez copier les clés secrètes.

1.  Sur votre tableau de bord Netlify, allez dans **Site configuration** > **Environment variables**.
2.  Cliquez sur **Add a variable** > **Add a single variable**.
3.  Ajoutez ces deux variables (vous les trouverez dans votre fichier `.env` actuel ou sur l'interface Bolt) :

    *   **Clé :** `VITE_SUPABASE_URL`
    *   **Valeur :** `https://kqlzvxfdzandgdkqzggj.supabase.co`

    *   **Clé :** `VITE_SUPABASE_ANON_KEY`
    *   **Valeur :** (Copiez la longue clé qui commence par `eyJ...` que vous avez dans votre projet actuel)

    *Rappel : J'ai déjà mis ces valeurs par défaut dans `netlify.toml` pour le build, mais c'est une meilleure pratique de les mettre aussi dans l'interface Netlify pour la sécurité.*

## Étape 5 : C'est en ligne !

Netlify va construire votre site (cela prend environ 1-2 minutes).
Une fois fini, vous aurez une URL du type `https://sprintflow-random-name.netlify.app`.

### Personnaliser votre nom de domaine (Optionnel)
1.  Allez dans **Domain management**.
2.  Cliquez sur **Options** à côté du nom bizarre et faites **Edit site name**.
3.  Changez-le en `sprintflow-app` (si disponible) ou ce que vous voulez. Votre nouvelle adresse sera `https://sprintflow-app.netlify.app`.

---

## Comment mettre à jour le site ensuite ?

C'est la magie du système :
1.  Vous continuez à travailler ici (sur Bolt ou ailleurs).
2.  Quand vous faites un changement et que vous le sauvegardez (Commit & Push), **Netlify détecte le changement et met à jour le site automatiquement en quelques secondes.**
3.  Plus besoin de bouton "Publish" manuel.

---

## Résumé technique des corrections apportées

J'ai modifié `netlify.toml` et `vite.config.ts` pour :
1.  **Forcer le rafraîchissement du cache** sur le fichier `index.html`.
2.  **Activer la mise à jour immédiate** du Service Worker (PWA).

Désormais, dès qu'une nouvelle version est déployée sur Netlify, vos utilisateurs l'auront immédiatement, sans rester bloqués sur l'ancienne version.
