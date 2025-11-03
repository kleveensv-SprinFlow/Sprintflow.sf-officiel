/*
  # Création automatique du profil après confirmation d'email

  1. Fonctionnement
    - Créer un trigger qui détecte quand un utilisateur confirme son email
    - Créer automatiquement le profil avec les données de `raw_user_meta_data`
    - Si le profil existe déjà, le mettre à jour avec les bonnes données

  2. Sécurité
    - Le trigger s'exécute au niveau système (pas de RLS)
    - Utilise les données stockées de manière sécurisée dans `raw_user_meta_data`
    - Garantit que chaque utilisateur confirmé a un profil
*/

-- Fonction pour créer ou mettre à jour le profil après confirmation email
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier si l'email vient d'être confirmé (changement de NULL à une date)
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Créer ou mettre à jour le profil avec les données de raw_user_meta_data
    INSERT INTO public.profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      full_name
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
      CONCAT(
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      )
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      role = EXCLUDED.role,
      full_name = EXCLUDED.full_name,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$;

-- Créer le trigger sur auth.users
DROP TRIGGER IF EXISTS on_email_confirmation ON auth.users;
CREATE TRIGGER on_email_confirmation
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();
