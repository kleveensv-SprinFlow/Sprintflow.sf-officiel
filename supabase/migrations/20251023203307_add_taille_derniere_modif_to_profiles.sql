/*
  # Ajout de la colonne taille_derniere_modif à la table profiles

  1. Modifications
    - Ajouter la colonne `taille_derniere_modif` (timestamptz) à la table `profiles`
    - Cette colonne permet de gérer la contrainte de modification de la taille (1 fois par 30 jours)
    - Valeur par défaut : NULL (permet la première modification)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'taille_derniere_modif'
  ) THEN
    ALTER TABLE profiles ADD COLUMN taille_derniere_modif timestamptz DEFAULT NULL;
  END IF;
END $$;