/*
  # Correction du trigger : retirer full_name

  1. Problème
    - full_name est une colonne générée
    - On ne peut pas l'insérer ou la mettre à jour manuellement

  2. Solution
    - Retirer full_name de l'INSERT et du UPDATE
*/

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

    -- Créer ou mettre à jour le profil (sans full_name qui est générée)
    INSERT INTO public.profiles (
      id,
      email,
      first_name,
      last_name,
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
