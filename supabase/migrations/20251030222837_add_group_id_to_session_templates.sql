/*
  # Ajout de group_id et completed à session_templates

  1. Modifications
    - Ajoute la colonne `group_id` (uuid, nullable) avec FK vers `groups`
    - Ajoute la colonne `completed` (boolean, default false)
    - Crée des index pour optimiser les requêtes
    
  2. Security
    - Met à jour les politiques RLS pour prendre en compte group_id
    - Les coaches peuvent voir leurs templates
    - Les athlètes peuvent voir les templates de leur groupe
    
  3. Notes importantes
    - group_id est nullable pour permettre templates personnels du coach
    - completed permet de tracker les séances terminées
*/

-- Ajouter group_id à session_templates
ALTER TABLE session_templates 
ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES groups(id) ON DELETE CASCADE;

-- Ajouter completed pour tracker les séances terminées
ALTER TABLE session_templates 
ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_session_templates_group_id 
ON session_templates(group_id);

CREATE INDEX IF NOT EXISTS idx_session_templates_coach_group 
ON session_templates(coach_id, group_id);

CREATE INDEX IF NOT EXISTS idx_session_templates_completed 
ON session_templates(completed) WHERE completed = false;

-- Supprimer anciennes politiques
DROP POLICY IF EXISTS "Coaches and athletes can view session templates" ON session_templates;
DROP POLICY IF EXISTS "Coaches can manage their session templates" ON session_templates;

-- Nouvelles politiques RLS plus précises
CREATE POLICY "Coaches can view their own session templates"
ON session_templates FOR SELECT
TO authenticated
USING (coach_id = auth.uid());

CREATE POLICY "Athletes can view session templates from their groups"
ON session_templates FOR SELECT
TO authenticated
USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE athlete_id = auth.uid()
  )
);

CREATE POLICY "Coaches can insert session templates"
ON session_templates FOR INSERT
TO authenticated
WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update their session templates"
ON session_templates FOR UPDATE
TO authenticated
USING (coach_id = auth.uid())
WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can delete their session templates"
ON session_templates FOR DELETE
TO authenticated
USING (coach_id = auth.uid());
