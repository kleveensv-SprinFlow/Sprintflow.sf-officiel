/*
  # Trigger automatique pour l'analyse des séances d'entraînement

  1. Fonction PostgreSQL
    - Crée une fonction qui appelle l'Edge Function analyser_seance
    - Se déclenche après INSERT ou UPDATE sur workouts

  2. Trigger
    - Déclenche l'analyse automatiquement après chaque modification
    - Envoie les données de l'entraînement à l'Edge Function

  Note: Le trigger utilise pg_net pour faire des requêtes HTTP asynchrones
*/

-- Activer l'extension pg_net si elle n'existe pas
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Créer la fonction qui appelle l'Edge Function
CREATE OR REPLACE FUNCTION trigger_analyser_seance()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
  service_role_key text;
BEGIN
  -- Construire l'URL de la fonction Edge
  function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/analyser_seance';
  service_role_key := current_setting('app.settings.supabase_service_role_key', true);

  -- Si les variables ne sont pas configurées, utiliser les valeurs par défaut de l'environnement
  IF function_url IS NULL OR function_url = '/functions/v1/analyser_seance' THEN
    function_url := 'https://' || current_setting('request.headers', true)::json->>'host' || '/functions/v1/analyser_seance';
  END IF;

  -- Faire l'appel HTTP asynchrone à l'Edge Function
  SELECT net.http_post(
    url := function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(service_role_key, '')
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'record', row_to_json(NEW)
    )
  ) INTO request_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger sur la table workouts
DROP TRIGGER IF EXISTS on_workout_change_analyze ON workouts;

CREATE TRIGGER on_workout_change_analyze
  AFTER INSERT OR UPDATE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_analyser_seance();

-- Commentaire explicatif
COMMENT ON FUNCTION trigger_analyser_seance() IS 'Appelle automatiquement l''Edge Function analyser_seance après insertion ou modification d''un entraînement';