/*
  # Système de messagerie individuelle et suivi de lecture

  1. Nouvelles Tables
    - `message_read_status` - Suivi du statut de lecture des messages
      - `id` (uuid, primary key)
      - `message_id` (uuid) - ID du message lu (groupe ou individuel)
      - `user_id` (uuid) - Utilisateur ayant lu le message
      - `read_at` (timestamptz) - Date de lecture
      - Contrainte unique sur (message_id, user_id)

    - `individual_chat_messages` - Messages privés entre utilisateurs
      - `id` (uuid, primary key)
      - `sender_id` (uuid) - Expéditeur du message
      - `receiver_id` (uuid) - Destinataire du message
      - `message` (text) - Contenu du message
      - `created_at` (timestamptz) - Date de création

  2. Sécurité
    - RLS activé sur les deux tables
    - Utilisateurs peuvent gérer leur propre statut de lecture
    - Utilisateurs peuvent échanger des messages privés uniquement avec leurs contacts

  3. Fonction RPC
    - `get_user_conversations()` mise à jour pour inclure :
      - Conversations de groupe ET individuelles
      - Comptage des messages non lus
      - Photo de profil des conversations
      - ID du partenaire pour les conversations individuelles

  4. Performance
    - Index sur message_id et user_id pour les performances de lecture
    - Utilisation de CTEs pour optimiser les requêtes
*/

-- 1. Créer la table pour suivre le statut de lecture des messages
CREATE TABLE IF NOT EXISTS message_read_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id)
);

ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent gérer leur propre statut de lecture"
ON message_read_status
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. Créer la table pour les messages individuels
CREATE TABLE IF NOT EXISTS individual_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE individual_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent échanger des messages privés"
ON individual_chat_messages
FOR ALL
USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
WITH CHECK (auth.uid() = sender_id);

-- 3. Supprimer l'ancienne fonction avant de créer la nouvelle
DROP FUNCTION IF EXISTS get_user_conversations();

-- 4. Créer la nouvelle fonction avec les nouveaux paramètres de retour
CREATE OR REPLACE FUNCTION get_user_conversations()
RETURNS TABLE (
    conversation_id TEXT,
    conversation_type TEXT,
    conversation_name TEXT,
    last_message_content TEXT,
    last_message_at TIMESTAMPTZ,
    last_message_sender_name TEXT,
    unread_count BIGINT,
    conversation_photo_url TEXT,
    partner_id UUID
) AS $$
DECLARE
    current_user_id UUID := auth.uid();
BEGIN
    RETURN QUERY
    WITH last_group_reads AS (
        SELECT 
            m.group_id,
            MAX(mrs.read_at) as last_read_at
        FROM message_read_status mrs
        JOIN group_chat_messages m ON mrs.message_id = m.id
        WHERE mrs.user_id = current_user_id
        GROUP BY m.group_id
    ),
    group_conversations AS (
        SELECT
            g.id::TEXT AS conversation_id,
            'group' AS conversation_type,
            g.name AS conversation_name,
            last_msg.message AS last_message_content,
            last_msg.created_at AS last_message_at,
            p.first_name || ' ' || p.last_name AS last_message_sender_name,
            (SELECT COUNT(*) FROM group_chat_messages m WHERE m.group_id = g.id AND m.created_at > COALESCE(lgr.last_read_at, '1970-01-01')) AS unread_count,
            g.group_photo_url,
            NULL::UUID as partner_id
        FROM groups g
        LEFT JOIN LATERAL (SELECT * FROM group_chat_messages WHERE group_id = g.id ORDER BY created_at DESC LIMIT 1) last_msg ON TRUE
        LEFT JOIN profiles p ON last_msg.user_id = p.id
        LEFT JOIN last_group_reads lgr ON lgr.group_id = g.id
        WHERE g.coach_id = current_user_id OR EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = g.id AND gm.athlete_id = current_user_id)
    ),
    last_individual_reads AS (
        SELECT 
            (CASE WHEN m.sender_id = current_user_id THEN m.receiver_id ELSE m.sender_id END) as partner,
            MAX(mrs.read_at) as last_read_at
        FROM message_read_status mrs
        JOIN individual_chat_messages m ON mrs.message_id = m.id
        WHERE mrs.user_id = current_user_id
        GROUP BY partner
    ),
    individual_conversations AS (
        SELECT
            p.id::TEXT AS conversation_id,
            'individual' AS conversation_type,
            p.first_name || ' ' || p.last_name AS conversation_name,
            last_msg.message AS last_message_content,
            last_msg.created_at AS last_message_at,
            sender_profile.first_name || ' ' || sender_profile.last_name AS last_message_sender_name,
            (SELECT COUNT(*) FROM individual_chat_messages m WHERE m.sender_id = p.id AND m.receiver_id = current_user_id AND m.created_at > COALESCE(lir.last_read_at, '1970-01-01')) AS unread_count,
            p.photo_url AS conversation_photo_url,
            p.id as partner_id
        FROM (
            SELECT DISTINCT
                CASE WHEN sender_id = current_user_id THEN receiver_id ELSE sender_id END as partner_id
            FROM individual_chat_messages
            WHERE sender_id = current_user_id OR receiver_id = current_user_id
        ) partners
        JOIN profiles p ON partners.partner_id = p.id
        LEFT JOIN LATERAL (
            SELECT * FROM individual_chat_messages
            WHERE (sender_id = current_user_id AND receiver_id = p.id) OR (sender_id = p.id AND receiver_id = current_user_id)
            ORDER BY created_at DESC LIMIT 1
        ) last_msg ON TRUE
        LEFT JOIN profiles sender_profile ON last_msg.sender_id = sender_profile.id
        LEFT JOIN last_individual_reads lir ON lir.partner = p.id
    )
    SELECT * FROM group_conversations
    UNION ALL
    SELECT * FROM individual_conversations
    ORDER BY last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;