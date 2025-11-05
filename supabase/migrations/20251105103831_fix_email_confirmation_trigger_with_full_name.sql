/*
  # Correction du trigger de confirmation d'email - Ajout de full_name
  
  1. Modifications
    - Ajouter full_name dans la création/mise à jour du profil
    - full_name est généré automatiquement à partir de first_name et last_name
    
  2. Résolution du problème
    - Assure que le profil est créé avec toutes les informations nécessaires
    - full_name est maintenant inclus lors de la confirmation d'email
*/

-- Fonction corrigée pour créer ou mettre à jour le profil après confirmation email
CREATE OR REPLACE FUNCTION public.handle_email_confirmation()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_role text;
  user_first_name text;
  user_last_name text;
BEGIN
  -- Vérifier si l'email vient d'être confirmé (changement de NULL à une date)
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    -- Logger pour debug
    RAISE NOTICE 'Email confirmé pour user_id: %', NEW.id;
    RAISE NOTICE 'raw_user_meta_data: %', NEW.raw_user_meta_data;

    -- Extraire les valeurs avec fallbacks
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'athlete');
    user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
    user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

    -- Créer ou mettre à jour le profil avec TOUTES les données incluant full_name
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
      CONCAT(user_first_name, ' ', user_last_name),
      user_role,
      NEW.raw_user_meta_data->>'role_specifique',
      (NEW.raw_user_meta_data->>'date_de_naissance')::date,
      NEW.raw_user_meta_data->>'discipline',
      NEW.raw_user_meta_data->>'sexe',
      (NEW.raw_user_meta_data->>'height')::integer,
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
END;
$$;
