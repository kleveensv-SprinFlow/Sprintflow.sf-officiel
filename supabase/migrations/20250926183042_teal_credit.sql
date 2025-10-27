/*
  # Correction définitive de la colonne invitation_code

  1. Modifications
    - Ajouter la colonne `invitation_code` à la table `groups` si elle n'existe pas
    - Générer des codes d'invitation uniques pour tous les groupes existants
    - Ajouter une contrainte d'unicité sur cette colonne
    - Créer les fonctions et triggers nécessaires

  2. Sécurité
    - Maintenir les politiques RLS existantes
    - Assurer l'unicité des codes d'invitation
    - Gestion sécurisée des erreurs
*/

-- Fonction pour générer un code d'invitation unique
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
  attempts integer := 0;
BEGIN
  LOOP
    -- Générer un code de 8 caractères alphanumériques
    code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM groups WHERE invitation_code = code) INTO exists;
    
    -- Si le code n'existe pas, on peut l'utiliser
    IF NOT exists THEN
      EXIT;
    END IF;
    
    -- Éviter une boucle infinie
    attempts := attempts + 1;
    IF attempts > 100 THEN
      RAISE EXCEPTION 'Impossible de générer un code d''invitation unique après 100 tentatives';
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Ajouter la colonne invitation_code si elle n'existe pas
DO $$
BEGIN
  -- Vérifier si la colonne existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'groups' 
    AND column_name = 'invitation_code'
  ) THEN
    -- Ajouter la colonne
    ALTER TABLE groups ADD COLUMN invitation_code text;
    
    -- Générer des codes pour tous les groupes existants
    UPDATE groups 
    SET invitation_code = generate_invitation_code()
    WHERE invitation_code IS NULL;
    
    -- Rendre la colonne obligatoire
    ALTER TABLE groups ALTER COLUMN invitation_code SET NOT NULL;
    
    RAISE NOTICE 'Colonne invitation_code ajoutée avec succès à la table groups';
  ELSE
    RAISE NOTICE 'La colonne invitation_code existe déjà dans la table groups';
  END IF;
END $$;

-- Ajouter la contrainte d'unicité si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
    AND table_name = 'groups' 
    AND constraint_name = 'groups_invitation_code_unique'
  ) THEN
    ALTER TABLE groups ADD CONSTRAINT groups_invitation_code_unique UNIQUE (invitation_code);
    RAISE NOTICE 'Contrainte d''unicité ajoutée sur invitation_code';
  ELSE
    RAISE NOTICE 'La contrainte d''unicité existe déjà sur invitation_code';
  END IF;
END $$;

-- Fonction trigger pour générer automatiquement le code d'invitation
CREATE OR REPLACE FUNCTION set_invitation_code_on_insert()
RETURNS trigger AS $$
BEGIN
  -- Si aucun code n'est fourni, en générer un
  IF NEW.invitation_code IS NULL OR NEW.invitation_code = '' THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS groups_invitation_code_trigger ON groups;

-- Créer le nouveau trigger
CREATE TRIGGER groups_invitation_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code_on_insert();

-- Vérifier que tout fonctionne
DO $$
DECLARE
  test_code text;
BEGIN
  -- Tester la génération de code
  SELECT generate_invitation_code() INTO test_code;
  RAISE NOTICE 'Test de génération de code réussi: %', test_code;
  
  -- Vérifier la structure de la table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' 
    AND table_name = 'groups' 
    AND column_name = 'invitation_code'
  ) THEN
    RAISE NOTICE 'Vérification: La colonne invitation_code existe bien dans la table groups';
  ELSE
    RAISE EXCEPTION 'ERREUR: La colonne invitation_code n''existe toujours pas!';
  END IF;
END $$;