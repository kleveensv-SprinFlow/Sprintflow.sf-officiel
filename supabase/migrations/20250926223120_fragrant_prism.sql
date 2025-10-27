/*
  # Création de la table chat_messages pour les groupes

  1. Nouvelles Tables
    - `group_chat_messages` - Messages de chat dans les groupes
    - Stockage des conversations entre coachs et athlètes

  2. Sécurité
    - Enable RLS sur la table
    - Politiques pour membres du groupe uniquement

  3. Relations
    - Messages liés aux groupes
    - Messages liés aux utilisateurs
*/

-- Table des messages de chat de groupe
CREATE TABLE IF NOT EXISTS group_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour group_chat_messages
CREATE POLICY "Group members can read group messages"
  ON group_chat_messages
  FOR SELECT
  TO authenticated
  USING (
    -- Coach du groupe peut lire
    EXISTS (
      SELECT 1 FROM groups g
      WHERE g.id = group_chat_messages.group_id 
      AND g.coach_id = auth.uid()
    )
    OR
    -- Membres du groupe peuvent lire
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_chat_messages.group_id 
      AND gm.athlete_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages"
  ON group_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND
    (
      -- Coach du groupe peut envoyer
      EXISTS (
        SELECT 1 FROM groups g
        WHERE g.id = group_chat_messages.group_id 
        AND g.coach_id = auth.uid()
      )
      OR
      -- Membres du groupe peuvent envoyer
      EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = group_chat_messages.group_id 
        AND gm.athlete_id = auth.uid()
      )
    )
  );

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_group_id ON group_chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_user_id ON group_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_created_at ON group_chat_messages(created_at);