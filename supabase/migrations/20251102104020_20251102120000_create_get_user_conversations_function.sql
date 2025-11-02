/*
  # Création de la fonction get_user_conversations

  1. Fonction
    - `get_user_conversations()` - Retourne toutes les conversations d'un utilisateur
      - Conversations de groupe (où l'utilisateur est coach ou membre)
      - Dernier message de chaque conversation
      - Nom de l'expéditeur du dernier message
      - Photo de profil de la conversation
      - Compteur de messages non lus (prévu pour future implémentation)

  2. Sécurité
    - Fonction SECURITY DEFINER pour accéder aux données des groupes
    - Utilise auth.uid() pour filtrer les conversations de l'utilisateur connecté

  3. Performance
    - Utilise LATERAL JOIN pour récupérer efficacement le dernier message
    - Trie par date du dernier message (les plus récents en premier)
*/

CREATE OR REPLACE FUNCTION get_user_conversations()
RETURNS TABLE (
    conversation_id UUID,
    conversation_type TEXT,
    conversation_name TEXT,
    last_message_content TEXT,
    last_message_at TIMESTAMPTZ,
    last_message_sender_name TEXT,
    unread_count BIGINT,
    conversation_photo_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_groups AS (
        -- Groupes où l'utilisateur est coach
        SELECT g.id, g.name, g.group_photo_url
        FROM groups g
        WHERE g.coach_id = auth.uid()
        UNION
        -- Groupes où l'utilisateur est membre
        SELECT g.id, g.name, g.group_photo_url
        FROM group_members gm
        JOIN groups g ON gm.group_id = g.id
        WHERE gm.athlete_id = auth.uid()
    ),
    group_conversations AS (
        SELECT
            ug.id AS conversation_id,
            'group' AS conversation_type,
            ug.name AS conversation_name,
            m.message AS last_message_content,
            m.created_at AS last_message_at,
            p.first_name || ' ' || p.last_name AS last_message_sender_name,
            ug.group_photo_url AS conversation_photo_url
        FROM user_groups ug
        LEFT JOIN LATERAL (
            SELECT *
            FROM group_chat_messages
            WHERE group_id = ug.id
            ORDER BY created_at DESC
            LIMIT 1
        ) m ON TRUE
        LEFT JOIN profiles p ON m.user_id = p.id
    )
    SELECT
        gc.conversation_id,
        gc.conversation_type,
        gc.conversation_name,
        gc.last_message_content,
        gc.last_message_at,
        gc.last_message_sender_name,
        -- Le comptage des messages non lus sera ajouté plus tard
        0 AS unread_count,
        gc.conversation_photo_url
    FROM group_conversations gc
    ORDER BY last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;