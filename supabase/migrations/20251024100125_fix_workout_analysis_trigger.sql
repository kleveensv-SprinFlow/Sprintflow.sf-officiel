/*
  # Fix Workout Analysis Trigger

  1. Problem
    - The trigger tries to access 'request.headers' which causes "operator does not exist: text ->> unknown"
    - This happens because request.headers doesn't exist or returns NULL
    
  2. Solution
    - Use environment variables directly from Supabase
    - Remove the fallback to request.headers
    - Make the trigger more robust with better error handling
    
  3. Changes
    - Update trigger_analyser_seance() function
    - Add proper NULL checks
    - Use only available environment variables
*/

-- Recreate the function with a fix
CREATE OR REPLACE FUNCTION trigger_analyser_seance()
RETURNS TRIGGER AS $$
DECLARE
  request_id bigint;
  function_url text;
  supabase_url text;
BEGIN
  -- Try to get Supabase URL from settings
  BEGIN
    supabase_url := current_setting('app.settings.supabase_url', true);
  EXCEPTION WHEN OTHERS THEN
    supabase_url := NULL;
  END;
  
  -- If we don't have the URL, skip the trigger (don't block the insert)
  IF supabase_url IS NULL OR supabase_url = '' THEN
    RAISE NOTICE 'Skipping workout analysis - Supabase URL not configured';
    RETURN NEW;
  END IF;
  
  -- Build the function URL
  function_url := supabase_url || '/functions/v1/analyser_seance';
  
  -- Try to make the HTTP call, but don't fail if it doesn't work
  BEGIN
    SELECT net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(current_setting('app.settings.supabase_service_role_key', true), '')
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'record', row_to_json(NEW)
      )
    ) INTO request_id;
    
    RAISE NOTICE 'Workout analysis triggered with request_id: %', request_id;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the insert
    RAISE NOTICE 'Failed to trigger workout analysis: %', SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION trigger_analyser_seance() IS 'Appelle automatiquement l''Edge Function analyser_seance après insertion ou modification d''un entraînement. N''empêche pas l''insertion en cas d''erreur.';
