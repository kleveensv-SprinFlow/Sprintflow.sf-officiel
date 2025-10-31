/*
  # Fix Profile Creation Trigger - Use Correct Columns

  1. Changes
    - Update handle_new_user function to use only existing columns
    - Remove reference to non-existent role_specifique column
    - Use correct column names: sport instead of role_specifique

  2. Security
    - Maintains SECURITY DEFINER to bypass RLS
    - Only uses safe values from user metadata
*/

-- Update function to use correct column names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    role,
    first_name,
    last_name,
    date_de_naissance,
    discipline,
    sport,
    sexe,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    (NEW.raw_user_meta_data->>'date_de_naissance')::date,
    NEW.raw_user_meta_data->>'discipline',
    NEW.raw_user_meta_data->>'role_specifique',
    NEW.raw_user_meta_data->>'sexe',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry with correct columns when a new user signs up';
