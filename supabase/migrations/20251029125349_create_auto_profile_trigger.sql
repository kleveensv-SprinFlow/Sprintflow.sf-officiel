/*
  # Création automatique du profil utilisateur

  1. Fonction trigger
    - Crée automatiquement un profil lors de la création d'un utilisateur
    - Extrait les données depuis auth.users.raw_user_meta_data
    - Évite les erreurs RLS car exécuté avec SECURITY DEFINER

  2. Trigger
    - Se déclenche après INSERT dans auth.users
    - Appelle la fonction handle_new_user()

  3. Mise à jour
    - Met à jour les profils existants avec les métadonnées manquantes
*/

-- Fonction pour créer automatiquement le profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    first_name,
    last_name,
    email,
    discipline,
    sexe,
    created_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    NEW.raw_user_meta_data->>'discipline',
    NEW.raw_user_meta_data->>'sexe',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    email = COALESCE(EXCLUDED.email, profiles.email),
    discipline = COALESCE(EXCLUDED.discipline, profiles.discipline),
    sexe = COALESCE(EXCLUDED.sexe, profiles.sexe);
  
  RETURN NEW;
END;
$$;

-- Supprimer le trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Mettre à jour les profils existants avec les métadonnées manquantes
UPDATE public.profiles p
SET
  first_name = COALESCE(p.first_name, u.raw_user_meta_data->>'first_name'),
  last_name = COALESCE(p.last_name, u.raw_user_meta_data->>'last_name'),
  email = COALESCE(p.email, u.email),
  discipline = COALESCE(p.discipline, u.raw_user_meta_data->>'discipline'),
  sexe = COALESCE(p.sexe, u.raw_user_meta_data->>'sexe')
FROM auth.users u
WHERE p.id = u.id
  AND (p.first_name IS NULL OR p.last_name IS NULL OR p.email IS NULL);
