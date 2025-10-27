/*
  # Ajouter la date de naissance au profil

  1. Modifications
    - Ajouter la colonne `birth_date` à la table `profiles`
    - Type: date (nullable)
    - Permet de stocker la date de naissance des utilisateurs

  2. Sécurité
    - Aucune modification des politiques RLS existantes
    - La colonne est accessible selon les mêmes règles que les autres champs du profil
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date date;
  END IF;
END $$;