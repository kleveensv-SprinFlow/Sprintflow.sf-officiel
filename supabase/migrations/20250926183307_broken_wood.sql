/*
  # Création complète de la table groups avec invitation_code

  1. Nouvelles Tables
    - Recréation complète de la table `groups` avec toutes les colonnes nécessaires
    - Ajout de la colonne `invitation_code` dès la création

  2. Sécurité
    - Enable RLS sur la table
    - Politiques pour coachs et athlètes
    - Contraintes d'unicité

  3. Fonctions
    - Génération automatique des codes d'invitation
    - Triggers pour l'auto-génération
*/

-- Supprimer la table groups existante si elle existe (pour la recréer proprement)
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS groups CASCADE;

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

-- Créer la table groups avec toutes les colonnes nécessaires
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitation_code text NOT NULL DEFAULT generate_invitation_code(),
  max_members integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT groups_invitation_code_unique UNIQUE (invitation_code)
);

-- Créer la table group_members
CREATE TABLE group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  athlete_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, athlete_id)
);

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

-- Trigger pour générer automatiquement le code d'invitation
CREATE TRIGGER groups_invitation_code_trigger
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code_on_insert();

-- Trigger pour updated_at
CREATE TRIGGER groups_updated_at_trigger
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour groups
CREATE POLICY "Coaches can manage their groups"
  ON groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "Athletes can read groups they belong to"
  ON groups
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_id = groups.id AND athlete_id = auth.uid()
    )
  );

-- Politiques RLS pour group_members
CREATE POLICY "Coaches can manage their group members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups 
      WHERE groups.id = group_members.group_id AND groups.coach_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can read their group memberships"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (athlete_id = auth.uid());

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_groups_coach_id ON groups(coach_id);
CREATE INDEX IF NOT EXISTS idx_groups_invitation_code ON groups(invitation_code);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_id ON group_members(athlete_id);

-- Test de la fonction
DO $$
DECLARE
  test_code text;
BEGIN
  -- Tester la génération de code
  SELECT generate_invitation_code() INTO test_code;
  RAISE NOTICE 'Test de génération de code réussi: %', test_code;
  
  RAISE NOTICE 'Table groups recréée avec succès avec la colonne invitation_code';
END $$;