/*
  # Ajouter group_id à session_templates

  1. Modifications de table
    - Ajouter colonne `group_id` à `session_templates`
    - Créer contrainte de clé étrangère vers `groups`
    - Créer index pour optimiser les requêtes

  2. Sécurité
    - Mettre à jour la politique RLS pour inclure le group_id
    - S'assurer que seuls les coachs du groupe peuvent gérer les séances

  3. Notes importantes
    - Cette migration ajoute une contrainte NOT NULL après avoir ajouté la colonne
    - Les séances existantes sans group_id seront supprimées
*/

-- Ajouter la colonne group_id (nullable temporairement)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_templates' AND column_name = 'group_id'
  ) THEN
    ALTER TABLE session_templates ADD COLUMN group_id uuid;
  END IF;
END $$;

-- Supprimer les séances existantes qui n'ont pas de group_id
DELETE FROM session_templates WHERE group_id IS NULL;

-- Rendre la colonne NOT NULL maintenant qu'elle est nettoyée
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'session_templates' AND column_name = 'group_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE session_templates ALTER COLUMN group_id SET NOT NULL;
  END IF;
END $$;

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'session_templates' AND constraint_name = 'session_templates_group_id_fkey'
  ) THEN
    ALTER TABLE session_templates 
    ADD CONSTRAINT session_templates_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Créer un index pour optimiser les requêtes par group_id
CREATE INDEX IF NOT EXISTS idx_session_templates_group_id 
ON session_templates(group_id);

-- Mettre à jour la politique RLS pour inclure le group_id
DROP POLICY IF EXISTS "session_templates_policy" ON session_templates;

CREATE POLICY "session_templates_group_policy"
  ON session_templates
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id FROM groups WHERE coach_id = auth.uid()
    )
  );