# Activer la Confirmation d'Email

## ✅ Code Prêt

Le code de l'application est maintenant configuré pour gérer la confirmation d'email :

- ✅ Écran de confirmation après inscription
- ✅ Message invitant l'utilisateur à vérifier son email
- ✅ Redirection après confirmation
- ✅ Trigger PostgreSQL qui crée le profil automatiquement après confirmation
- ✅ Détection automatique du mode (avec ou sans confirmation)

## 🔧 Configuration Supabase Requise

Pour activer la confirmation d'email, suivez ces étapes dans votre Dashboard Supabase :

### 1. Accéder aux Paramètres d'Authentification

1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Dans le menu latéral, cliquez sur **Authentication**
4. Cliquez sur l'onglet **Providers**
5. Sélectionnez **Email**

### 2. Activer la Confirmation d'Email

1. Trouvez la section **Email Settings**
2. **Activez** l'option : **"Confirm email"**
3. Cliquez sur **Save** en bas de la page

### 3. Configurer les URLs de Redirection (Important !)

1. Toujours dans **Authentication**, cliquez sur **URL Configuration**
2. Dans **Redirect URLs**, ajoutez vos URLs autorisées :
   - Pour le développement local : `http://localhost:5173/`
   - Pour la production : `https://votre-domaine.com/`
3. Cliquez sur **Save**

### 4. Personnaliser l'Email (Optionnel)

1. Dans **Authentication > Email Templates**
2. Sélectionnez **Confirm signup**
3. Personnalisez le message et le design selon vos besoins
4. Cliquez sur **Save**

## 🧪 Tester la Confirmation d'Email

1. **Déconnectez-vous** de l'application
2. **Créez un nouveau compte** avec un email valide
3. Vous devriez voir un écran avec le message : **"Vérifiez votre email"**
4. **Vérifiez votre boîte mail** et cliquez sur le lien de confirmation
5. Vous serez redirigé vers l'application et connecté automatiquement

## 📧 Vérification des Emails

Si vous ne recevez pas l'email :

1. Vérifiez vos **spams/courrier indésirable**
2. Dans Supabase Dashboard > **Authentication > Users**, vérifiez que l'utilisateur est créé avec `email_confirmed_at: null`
3. Vérifiez la configuration SMTP dans **Project Settings > Auth > SMTP Settings** (par défaut, Supabase utilise son propre service d'email)

## ⚠️ Mode Sans Confirmation (Développement)

Si vous souhaitez **désactiver** la confirmation d'email pour le développement :

1. Dans Supabase Dashboard > **Authentication > Providers > Email**
2. **Désactivez** l'option **"Confirm email"**
3. Les utilisateurs seront connectés immédiatement après l'inscription

## 🔄 Comportement Actuel

### Avec Confirmation d'Email Activée

1. L'utilisateur remplit le formulaire d'inscription
2. L'application affiche l'écran **"Vérifiez votre email"**
3. L'utilisateur reçoit un email avec un lien de confirmation
4. Au clic sur le lien, l'utilisateur est redirigé vers l'application
5. Un **trigger PostgreSQL** crée automatiquement le profil avec les bonnes données
6. L'utilisateur est connecté automatiquement

### Sans Confirmation d'Email (Mode Actuel)

1. L'utilisateur remplit le formulaire d'inscription
2. Le profil est créé immédiatement
3. L'utilisateur est connecté automatiquement
4. Pas d'email de confirmation nécessaire

Le code **détecte automatiquement** le mode configuré et s'adapte en conséquence.

## 🔧 Architecture Technique

### Trigger PostgreSQL

Un trigger `handle_email_confirmation` a été créé qui :

1. Se déclenche quand `email_confirmed_at` passe de NULL à une date
2. Crée le profil avec les données de `raw_user_meta_data`
3. Si le profil existe déjà, le met à jour
4. Garantit que chaque utilisateur confirmé a un profil complet

### Code Frontend

Le code JavaScript :

1. Vérifie si `data.session` existe après l'inscription
2. **Si session existe** (confirmation désactivée) → crée le profil manuellement
3. **Si session null** (confirmation activée) → affiche l'écran de confirmation, le trigger créera le profil plus tard

Cette double approche garantit que le système fonctionne dans les deux modes.
