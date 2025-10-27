/*
  # Création de la table session_templates

  1. Nouvelles Tables
    - `session_templates` - Modèles de séances créés par les coachs
    - Stockage des exercices en JSONB pour flexibilité

  2. Sécurité
    - Enable RLS sur la table
    - Politiques pour que seuls les coachs puissent gérer leurs modèles

  3. Relations
    - Modèles liés aux coachs
    - Exercices stockés en JSONB
*/

-- Table des modèles de séances
CREATE TABLE IF NOT EXISTS session_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  session_type text NOT NULL CHECK (session_type IN ('training', 'recovery', 'rest')),
  duration_minutes integer DEFAULT 60,
  intensity text CHECK (intensity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  exercises jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER session_templates_updated_at_trigger
  BEFORE UPDATE ON session_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour session_templates
CREATE POLICY "Coaches can manage their own session templates"
  ON session_templates
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid());

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_session_templates_coach_id ON session_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_session_templates_session_type ON session_templates(session_type);