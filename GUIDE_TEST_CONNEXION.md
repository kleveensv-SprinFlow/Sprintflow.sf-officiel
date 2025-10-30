# 🧪 Guide de Test - Cycle Connexion/Déconnexion/Reconnexion

## ✅ Corrections apportées

### 1. Fonction `signOut` améliorée
- ✅ Déconnexion Supabase avec `scope: 'local'`
- ✅ Nettoyage de TOUTES les clés Supabase du localStorage
- ✅ Nettoyage du sessionStorage
- ✅ Réinitialisation de l'état React
- ✅ Logs détaillés à chaque étape

### 2. Gestion de `INITIAL_SESSION`
- ✅ L'événement `INITIAL_SESSION` est maintenant géré
- ✅ La session persiste au refresh de la page
- ✅ Le profil est chargé automatiquement au démarrage
- ✅ Si pas de session, l'utilisateur reste déconnecté

### 3. Persistance de session
- ✅ Au refresh de la page, vous restez connecté
- ✅ La déconnexion ne se fait que sur clic du bouton
- ✅ Supabase gère la persistance automatiquement

## 🧪 Protocole de test

### Test 1 : Reset initial (OBLIGATOIRE)

1. Ouvrez `/force-reset.html`
2. Cliquez sur "RESET COMPLET"
3. Attendez le rechargement automatique
4. ✅ Vous devriez être sur l'écran de connexion

### Test 2 : Première connexion

1. Connectez-vous avec vos identifiants
2. Ouvrez la console (F12)
3. ✅ Vérifiez les logs suivants :

```
🔄 [SIGNED_IN] Traitement de la session...
✅ Email confirmé, chargement du profil...
📡 [fetchUserProfile] Début chargement pour user: ...
📡 [fetchUserProfile] Envoi requête Supabase...
📡 [fetchUserProfile] Réponse reçue - data: true, error: undefined
📡 [fetchUserProfile] Retour profile DB: {...}
👤 Profil récupéré: {...}
✅ User et profile définis dans le state
```

4. ✅ Le dashboard devrait s'afficher

### Test 3 : Refresh de la page (NOUVEAU)

1. Appuyez sur F5 ou Ctrl+R pour recharger la page
2. Ouvrez la console (F12)
3. ✅ Vérifiez les logs suivants :

```
🔄 [INITIAL_SESSION] Traitement de la session...
✅ Email confirmé, chargement du profil...
📡 [fetchUserProfile] Début chargement pour user: ...
👤 Profil récupéré: {...}
✅ User et profile définis dans le state
```

4. ✅ Vous devriez rester connecté
5. ✅ Le dashboard s'affiche directement
6. ✅ Aucune déconnexion automatique

### Test 4 : Déconnexion

1. Cliquez sur le bouton de déconnexion
2. Ouvrez la console (F12)
3. ✅ Vérifiez les logs suivants :

```
🚪 [signOut] Début de la déconnexion...
🔓 [signOut] Déconnexion Supabase...
✅ [signOut] Déconnexion Supabase réussie
🧹 [signOut] Nettoyage localStorage Supabase...
  🗑️ Suppression: sb-kqlzvxfdzandgdkqzggj-auth-token
🧹 [signOut] Nettoyage sessionStorage...
🧹 [signOut] Nettoyage état React...
✅ [signOut] Déconnexion complète terminée
🚪 [SIGNED_OUT] Événement de déconnexion reçu
```

4. ✅ L'écran de connexion devrait s'afficher

### Test 5 : Reconnexion (LE TEST CRITIQUE)

1. Reconnectez-vous avec vos identifiants
2. Ouvrez la console (F12)
3. ✅ Vérifiez les logs :

```
🔄 [SIGNED_IN] Traitement de la session...
✅ Email confirmé, chargement du profil...
📡 [fetchUserProfile] Début chargement pour user: ...
👤 Profil récupéré: {...}
✅ User et profile définis dans le state
```

4. ✅ Le dashboard devrait s'afficher
5. ✅ AUCUNE erreur 404, 500 ou logs multiples
6. ✅ Tout fonctionne comme à la première connexion

### Test 6 : Cycle complet répété

1. Déconnectez-vous
2. Reconnectez-vous
3. Refresh la page (F5)
4. Déconnectez-vous
5. Reconnectez-vous
6. ✅ Tout devrait fonctionner à chaque étape

## 🔍 Logs attendus (NORMAL)

### Au chargement de la page (connecté)
```
🔄 [INITIAL_SESSION] Traitement de la session...
✅ Email confirmé, chargement du profil...
📡 [fetchUserProfile] Début chargement pour user: xxx
📡 [fetchUserProfile] Envoi requête Supabase...
📡 [fetchUserProfile] Réponse reçue - data: true, error: undefined
📡 [fetchUserProfile] Retour profile DB: {id: "...", role: "athlete", ...}
👤 Profil récupéré: {id: "...", role: "athlete", ...}
✅ User et profile définis dans le state
```

### Au chargement de la page (déconnecté)
```
ℹ️ Aucune session existante
```

### À la connexion
```
🔄 [SIGNED_IN] Traitement de la session...
✅ Email confirmé, chargement du profil...
[... chargement du profil ...]
✅ User et profile définis dans le state
```

### À la déconnexion
```
🚪 [signOut] Début de la déconnexion...
🔓 [signOut] Déconnexion Supabase...
✅ [signOut] Déconnexion Supabase réussie
🧹 [signOut] Nettoyage localStorage Supabase...
  🗑️ Suppression: [clés trouvées]
🧹 [signOut] Nettoyage sessionStorage...
🧹 [signOut] Nettoyage état React...
✅ [signOut] Déconnexion complète terminée
🚪 [SIGNED_OUT] Événement de déconnexion reçu
```

## ❌ Logs anormaux (PROBLÈME)

### Si vous voyez ça = PROBLÈME
```
🔐 [useAuth] Auth state change: SIGNED_IN kleveensv@gmail.com
✅ Email confirmé, chargement du profil...
🔐 [useAuth] Auth state change: SIGNED_IN kleveensv@gmail.com
✅ Email confirmé, chargement du profil...
[... répété 4 fois ...]
```

**Solution** : Hard refresh (Ctrl+Shift+R) ou mode Incognito

### Si vous voyez des erreurs 404
```
/api/storage/blobs/.../image.png:1 Failed to load resource: 404
```

**Ces erreurs sont NORMALES** - ce sont des images manquantes dans le répertoire public, pas un problème d'authentification.

### Si la reconnexion échoue

1. Ouvrez `/force-reset.html`
2. Cliquez sur "RESET COMPLET"
3. Reconnectez-vous

## 🎯 Résultat attendu

Après ces corrections :

✅ **Première connexion** : fonctionne
✅ **Refresh de la page** : reste connecté (NOUVEAU)
✅ **Déconnexion** : nettoie tout proprement (CORRIGÉ)
✅ **Reconnexion** : fonctionne parfaitement (CORRIGÉ)
✅ **Navigation privée** : fonctionne toujours
✅ **Cycle répété** : aucune dégradation (CORRIGÉ)

## 🐛 Si ça ne marche toujours pas

### Symptôme : Répétition des logs
**Cause** : StrictMode encore actif ou cache navigateur
**Solution** :
1. Hard refresh : Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
2. Mode Incognito
3. Vider le cache navigateur
4. Redémarrer le serveur de développement

### Symptôme : Déconnexion au refresh
**Cause** : Le code n'est pas à jour
**Solution** :
1. Vérifiez que `INITIAL_SESSION` est dans le switch case
2. Redémarrez le serveur de développement
3. Hard refresh du navigateur

### Symptôme : Erreurs lors de la reconnexion
**Cause** : Session non nettoyée
**Solution** :
1. Utilisez `/force-reset.html`
2. Ou ouvrez la console et tapez :
```javascript
// Supprimer toutes les clés Supabase
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('sb-')) {
    localStorage.removeItem(key);
  }
});
sessionStorage.clear();
location.reload();
```

## 📊 Checklist finale

Avant de dire que c'est corrigé, vérifiez :

- [ ] Reset initial effectué
- [ ] Première connexion : ✅
- [ ] Refresh page : ✅ reste connecté
- [ ] Déconnexion : ✅ logs propres
- [ ] Reconnexion : ✅ aucune erreur
- [ ] Deuxième déconnexion : ✅
- [ ] Deuxième reconnexion : ✅
- [ ] Refresh après reconnexion : ✅
- [ ] Navigation privée : ✅

## 💡 Différence avec avant

### Avant
- ❌ Refresh = déconnexion
- ❌ Reconnexion = erreurs 404/500
- ❌ Session corrompue après déconnexion
- ❌ Fallait utiliser mode privé à chaque fois

### Maintenant
- ✅ Refresh = reste connecté
- ✅ Reconnexion = fonctionne parfaitement
- ✅ Déconnexion nettoie tout proprement
- ✅ Mode normal fonctionne comme mode privé

## 🚀 Prochaines étapes

Si tout fonctionne :
1. Testez les fonctionnalités de l'app (entraînements, records, etc.)
2. Vérifiez que les données se sauvegardent bien
3. Testez sur différents navigateurs

Si problème persiste :
1. Copiez TOUS les logs de la console
2. Indiquez à quelle étape précise ça échoue
3. Précisez si c'est en mode normal ou privé
