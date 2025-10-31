/*
  # Ajout de la colonne role_specifique
  
  1. Modifications
    - Ajoute la colonne `role_specifique` à la table `profiles`
    - Type: text (peut être NULL pour les profils existants)
    - Permet de stocker le rôle détaillé:
      * Pour les athlètes: sprint, haies, sauts, lancers, etc.
      * Pour les encadrants: Coach, Kinésithérapeute, Nutritionniste, etc.
  
  2. Notes
    - Colonne nullable pour compatibilité avec les profils existants
    - Peut être remplie progressivement
*/

-- Ajouter la colonne role_specifique si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role_specifique'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role_specifique text;
  END IF;
END $$;
