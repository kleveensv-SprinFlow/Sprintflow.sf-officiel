/*
  # Correction des problèmes de sécurité et de performance - Index manquants

  ## Description
  Cette migration corrige les problèmes de performance liés aux clés étrangères non indexées.
  
  ## Changements
  1. Ajout d'index pour toutes les clés étrangères non indexées
  2. Suppression des index en double

  ## Impact
  - Amélioration significative des performances des requêtes JOIN
  - Réduction de la charge sur la base de données
*/

-- Index pour les clés étrangères non indexées

-- aliments_favoris
CREATE INDEX IF NOT EXISTS idx_aliments_favoris_athlete_id ON aliments_favoris(athlete_id);

-- aliments_personnels  
CREATE INDEX IF NOT EXISTS idx_aliments_personnels_athlete_id ON aliments_personnels(athlete_id);

-- custom_workout_types
CREATE INDEX IF NOT EXISTS idx_custom_workout_types_coach_id ON custom_workout_types(coach_id);

-- exercices_personnalises
CREATE INDEX IF NOT EXISTS idx_exercices_personnalises_creator_id ON exercices_personnalises(creator_id);
CREATE INDEX IF NOT EXISTS idx_exercices_personnalises_ref_id ON exercices_personnalises(exercice_reference_id);

-- group_chat_messages
CREATE INDEX IF NOT EXISTS idx_group_chat_msg_group_id ON group_chat_messages(group_id);

-- group_join_requests
CREATE INDEX IF NOT EXISTS idx_group_join_req_athlete_id ON group_join_requests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_group_join_req_group_id ON group_join_requests(group_id);

-- individual_chat_messages
CREATE INDEX IF NOT EXISTS idx_indiv_chat_msg_receiver_id ON individual_chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_indiv_chat_msg_sender_id ON individual_chat_messages(sender_id);

-- injury_logs
CREATE INDEX IF NOT EXISTS idx_injury_logs_user_id ON injury_logs(user_id);

-- journal_alimentaire
CREATE INDEX IF NOT EXISTS idx_journal_alimentaire_athlete_id ON journal_alimentaire(athlete_id);

-- message_read_status
CREATE INDEX IF NOT EXISTS idx_msg_read_status_user_id ON message_read_status(user_id);

-- objectifs
CREATE INDEX IF NOT EXISTS idx_objectifs_epreuve_id ON objectifs(epreuve_id);
CREATE INDEX IF NOT EXISTS idx_objectifs_user_id ON objectifs(user_id);

-- recettes_personnelles
CREATE INDEX IF NOT EXISTS idx_recettes_personnelles_athlete_id ON recettes_personnelles(athlete_id);

-- records
CREATE INDEX IF NOT EXISTS idx_records_exercice_id ON records(exercice_id);
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);

-- sprinty_conversations
CREATE INDEX IF NOT EXISTS idx_sprinty_conv_user_id ON sprinty_conversations(user_id);

-- sprinty_messages
CREATE INDEX IF NOT EXISTS idx_sprinty_msg_conversation_id ON sprinty_messages(conversation_id);

-- Suppression des index en double
DROP INDEX IF EXISTS idx_coach_athlete_links_athlete_id;
