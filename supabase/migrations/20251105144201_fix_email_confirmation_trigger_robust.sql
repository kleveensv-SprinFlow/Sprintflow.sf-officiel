/*
  # Correction du Trigger de Confirmation d'Email
  
  1. Problème Identifié
    - Le trigger échouait car il essayait d'insérer des valeurs NULL dans des colonnes NOT NULL
    - Erreur: "Error confirming user" lors du clic sur le lien de confirmation
  
  2. Solution
    - Ajout de valeurs par défaut pour toutes les colonnes obligatoires
    - Gestion robuste des données manquantes
    - Meilleure extraction des données de raw_user_meta_data
  
  3. Modifications
    - Remplacement de la fonction handle_email_confirmation
    - Ajout de valeurs par défaut pour role, first_name, last_name
    - Gestion sécurisée des conversions de type
*/

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS public.handle_email_confirmation() CASCADE;

-- Créer la nouvelle fonction corrigée
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_role text;
  user_first_name text;
  user_last_name text;
  user_full_name text;
  user_date_naissance date;
  user_height integer;
BEGIN
  -- Vérifier si l'email vient d'être confirmé
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    RAISE NOTICE 'Email confirmé pour user_id: %', NEW.id;
    RAISE NOTICE 'raw_user_meta_data: %', NEW.raw_user_meta_data;
    
    -- Extraire les valeurs avec fallbacks robustes
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'athlete');
    user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'Utilisateur');
    user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
    user_full_name := TRIM(CONCAT(user_first_name, ' ', user_last_name));
    
    -- Conversion sécurisée de la date
    BEGIN
      user_date_naissance := (NEW.raw_user_meta_data->>'date_de_naissance')::date;
    EXCEPTION WHEN OTHERS THEN
      user_date_naissance := NULL;
      RAISE NOTICE 'Impossible de convertir date_de_naissance';
    END;
    
    -- Conversion sécurisée de la taille
    BEGIN
      user_height := (NEW.raw_user_meta_data->>'height')::integer;
    EXCEPTION WHEN OTHERS THEN
      user_height := NULL;
      RAISE NOTICE 'Impossible de convertir height';
    END;
    
    -- Créer ou mettre à jour le profil
    INSERT INTO public.profiles (
      id,
      email,
      first_name,
      last_name,
      full_name,
      role,
      role_specifique,
      date_de_naissance,
      discipline,
      sexe,
      height,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      user_first_name,
      user_last_name,
      user_full_name,
      user_role,
      NEW.raw_user_meta_data->>'role_specifique',
      user_date_naissance,
      NEW.raw_user_meta_data->>'discipline',
      NEW.raw_user_meta_data->>'sexe',
      user_height,
      now(),
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      role_specifique = EXCLUDED.role_specifique,
      date_de_naissance = EXCLUDED.date_de_naissance,
      discipline = EXCLUDED.discipline,
      sexe = EXCLUDED.sexe,
      height = EXCLUDED.height,
      updated_at = now();
    
    RAISE NOTICE 'Profil créé/mis à jour pour user_id: %', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En cas d'erreur, logger mais ne pas bloquer la confirmation
    RAISE WARNING 'Erreur dans handle_email_confirmation pour user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_email_confirmation ON auth.users;
CREATE TRIGGER on_email_confirmation
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_email_confirmation();

-- Vérifier que le trigger est bien créé
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_email_confirmation'
  ) THEN
    RAISE NOTICE '✅ Trigger on_email_confirmation créé avec succès';
  ELSE
    RAISE EXCEPTION '❌ Échec de création du trigger';
  END IF;
END $$;
