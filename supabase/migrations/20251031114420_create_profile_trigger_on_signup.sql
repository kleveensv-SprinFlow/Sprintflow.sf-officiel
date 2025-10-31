/*
  # Créer automatiquement un profil à l'inscription
  
  1. Problème
    - signUp() ne retourne pas toujours de session (email confirmation possible)
    - Impossible de créer le profil manuellement sans session
    
  2. Solution
    - Trigger PostgreSQL qui crée automatiquement le profil
    - Déclenché lors de l'insertion dans auth.users
    - Utilise les métadonnées (raw_user_meta_data) pour remplir le profil
    
  3. Fonctionnement
    - L'utilisateur s'inscrit avec signUp(email, password, { data: { ... } })
    - Supabase insère dans auth.users avec les métadonnées
    - Le trigger s'exécute et crée le profil automatiquement
    - Les métadonnées sont stockées dans auth.users.raw_user_meta_data
*/

-- Fonction trigger pour créer le profil automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
BEGIN
  -- Récupérer le rôle depuis les métadonnées (avec fallback sur 'athlete')
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'athlete');
  
  -- Mapper 'encadrant' vers 'coach' pour la contrainte DB
  IF user_role = 'encadrant' THEN
    user_role := 'coach';
  END IF;

  -- Insérer le profil
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    role,
    role_specifique,
    date_de_naissance,
    discipline,
    sexe,
    email
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'role_specifique', ''),
    (NEW.raw_user_meta_data->>'date_de_naissance')::date,
    NEW.raw_user_meta_data->>'discipline',
    NEW.raw_user_meta_data->>'sexe',
    NEW.email
  );

  RETURN NEW;
END;
$$;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger sur auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
