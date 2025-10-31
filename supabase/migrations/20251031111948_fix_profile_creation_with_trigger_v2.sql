/*
  # Fix: Création automatique du profil lors de l'inscription
  
  1. Problème identifié
    - Les utilisateurs ne peuvent pas insérer leur profil car il n'y a pas de politique RLS pour INSERT
    - L'utilisateur n'est pas encore authentifié au moment de l'insertion
    
  2. Solution
    - Créer un trigger qui s'exécute automatiquement après la création d'un utilisateur
    - Le trigger s'exécute avec les privilèges SECURITY DEFINER (bypass RLS)
    - Crée un profil minimal avec les données disponibles
    
  3. Notes
    - Le profil est créé automatiquement avec un rôle par défaut 'athlete'
    - L'application devra ensuite mettre à jour le profil avec les données complètes
*/

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email)
  VALUES (
    new.id,
    'athlete',
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  RETURN new;
END;
$$;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
