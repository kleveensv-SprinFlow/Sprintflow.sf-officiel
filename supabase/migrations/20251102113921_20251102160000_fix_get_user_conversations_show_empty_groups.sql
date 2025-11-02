/*
  # Correction de get_user_conversations pour afficher les groupes sans messages

  1. Modifications
    - Modifier la fonction pour afficher tous les groupes de l'utilisateur
    - Même si le groupe n'a pas de messages, il doit apparaître dans la liste
    - Afficher les conversations individuelles même sans messages
    
  2. Notes importantes
    - Un groupe peut exister sans avoir de messages encore
    - Une conversation individuelle peut être initiée sans messages
    - L'ordre doit être par date du dernier message (DESC NULLS LAST)
*/

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
            COALESCE(p.first_name || ' ' || p.last_name, '') AS last_message_sender_name,
            COALESCE((
                SELECT COUNT(*) 
                FROM group_chat_messages m 
                WHERE m.group_id = g.id 
                AND m.created_at > COALESCE(lgr.last_read_at, '1970-01-01')
                AND m.user_id != current_user_id
            ), 0) AS unread_count,
            g.group_photo_url,
            NULL::UUID as partner_id
        FROM groups g
        LEFT JOIN LATERAL (
            SELECT * FROM group_chat_messages 
            WHERE group_id = g.id 
            ORDER BY created_at DESC 
            LIMIT 1
        ) last_msg ON TRUE
        LEFT JOIN profiles p ON last_msg.user_id = p.id
        LEFT JOIN last_group_reads lgr ON lgr.group_id = g.id
        WHERE g.coach_id = current_user_id 
           OR EXISTS (
               SELECT 1 FROM group_members gm 
               WHERE gm.group_id = g.id 
               AND gm.athlete_id = current_user_id
           )
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
            COALESCE(p.first_name || ' ' || p.last_name, 'Utilisateur') AS conversation_name,
            last_msg.message AS last_message_content,
            last_msg.created_at AS last_message_at,
            COALESCE(sender_profile.first_name || ' ' || sender_profile.last_name, '') AS last_message_sender_name,
            COALESCE((
                SELECT COUNT(*) 
                FROM individual_chat_messages m 
                WHERE m.sender_id = p.id 
                AND m.receiver_id = current_user_id 
                AND m.created_at > COALESCE(lir.last_read_at, '1970-01-01')
            ), 0) AS unread_count,
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
            WHERE (sender_id = current_user_id AND receiver_id = p.id) 
               OR (sender_id = p.id AND receiver_id = current_user_id)
            ORDER BY created_at DESC 
            LIMIT 1
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