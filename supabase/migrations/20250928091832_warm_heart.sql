/*
  # Créer la table notifications

  1. Nouvelle table
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key vers profiles)
      - `title` (text, obligatoire)
      - `message` (text, obligatoire)
      - `type` (text, obligatoire avec contrainte)
      - `is_read` (boolean, défaut false)
      - `action_url` (text, optionnel)
      - `action_label` (text, optionnel)
      - `related_entity_type` (text, optionnel)
      - `related_entity_id` (uuid, optionnel)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, optionnel)

  2. Sécurité
    - Activer RLS sur la table `notifications`
    - Politique pour que les utilisateurs voient leurs propres notifications
    - Politique pour que les utilisateurs créent leurs propres notifications
    - Politique pour que les utilisateurs marquent leurs notifications comme lues
*/

-- Créer la table notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'reminder')),
  is_read boolean NOT NULL DEFAULT false,
  action_url text,
  action_label text,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Activer RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politique pour lire ses propres notifications
CREATE POLICY "Users can read their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Politique pour créer ses propres notifications
CREATE POLICY "Users can create their own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Politique pour mettre à jour ses propres notifications (marquer comme lu)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politique pour supprimer ses propres notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Politique spéciale pour le développeur (envoi de notifications globales)
CREATE POLICY "Developer can manage all notifications"
  ON notifications
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);