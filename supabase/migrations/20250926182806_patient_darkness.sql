/*
  # Ajouter la colonne invitation_code à la table groups

  1. Modifications
    - Ajouter la colonne `invitation_code` à la table `groups`
    - Générer des codes d'invitation pour les groupes existants
    - Ajouter une contrainte d'unicité sur cette colonne

  2. Sécurité
    - Maintenir les politiques RLS existantes
    - Assurer l'unicité des codes d'invitation
*/

-- Ajouter la colonne invitation_code si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'invitation_code'
  ) THEN
    ALTER TABLE groups ADD COLUMN invitation_code text;
  END IF;
END $$;

-- Fonction pour générer un code d'invitation unique
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM groups WHERE invitation_code = code) INTO exists;
    IF NOT exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Générer des codes pour les groupes existants qui n'en ont pas
UPDATE groups 
SET invitation_code = generate_invitation_code()
WHERE invitation_code IS NULL;

-- Ajouter la contrainte d'unicité
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'groups' AND constraint_name = 'groups_invitation_code_key'
  ) THEN
    ALTER TABLE groups ADD CONSTRAINT groups_invitation_code_key UNIQUE (invitation_code);
  END IF;
END $$;

-- Trigger pour générer automatiquement le code d'invitation
CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.invitation_code IS NULL THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger s'il n'existe pas
DROP TRIGGER IF EXISTS groups_invitation_code_trigger ON groups;
CREATE TRIGGER groups_invitation_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code();