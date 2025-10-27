/*
  # Ajouter photo de groupe

  1. Modifications
    - Ajouter colonne `group_photo_url` à la table `groups`
    - Permettre aux coachs de modifier la photo de leur groupe

  2. Sécurité
    - Seuls les coachs peuvent modifier la photo de leur groupe
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'group_photo_url'
  ) THEN
    ALTER TABLE groups ADD COLUMN group_photo_url text;
  END IF;
END $$;