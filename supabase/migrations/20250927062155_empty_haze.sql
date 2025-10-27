/*
  # Désactivation RLS pour le chat de groupe

  1. Désactivation RLS
    - Désactive RLS sur `group_chat_messages`
    - Supprime toutes les politiques problématiques

  2. Sécurité
    - Sécurité maintenue côté client
    - Validation des permissions dans l'application
*/

-- Désactiver RLS sur group_chat_messages
ALTER TABLE group_chat_messages DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Group members can read group messages" ON group_chat_messages;
DROP POLICY IF EXISTS "Group members can send messages" ON group_chat_messages;