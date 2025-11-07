/*
  # CORRECTION DE L'INDICE DE FORME
  
  1. New Functions
    - `get_sleep_duration_score(duration_minutes)` - Helper function to calculate sleep score based on duration
    - `get_current_indice_forme(user_id_param)` - RPC function to calculate current wellness index
    
  2. Logic
    - Sleep score (40%): Duration quality * subjective feeling
    - Muscle fatigue score (40%): Inverted scale (100 - fatigue)
    - Stress score (20%): Inverted scale (100 - stress)
    - Final index: Weighted average of all three scores
    
  3. Security
    - Functions can be called by authenticated users
    - Uses existing RLS policies on wellness_log table
*/

-- Helper function pour le barème du sommeil
CREATE OR REPLACE FUNCTION get_sleep_duration_score(duration_minutes INT)
RETURNS INT AS $$
BEGIN
    IF duration_minutes IS NULL THEN RETURN 0; END IF;
    IF duration_minutes < 300 THEN RETURN 10;   -- Moins de 5h
    ELSIF duration_minutes < 360 THEN RETURN 40;   -- Entre 5h et 6h
    ELSIF duration_minutes < 420 THEN RETURN 75;   -- Entre 6h et 7h
    ELSIF duration_minutes <= 540 THEN RETURN 100; -- Entre 7h et 9h
    ELSIF duration_minutes <= 570 THEN RETURN 90;  -- Entre 9h et 9h30
    ELSE RETURN 70; -- Plus de 9h30
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction RPC principale pour calculer l'indice de forme
CREATE OR REPLACE FUNCTION get_current_indice_forme(user_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
    wellness_log_today RECORD;
    score_duree INT;
    score_sommeil NUMERIC;
    score_fatigue NUMERIC;
    score_stress NUMERIC;
    final_indice NUMERIC;
BEGIN
    -- Sélectionner le check-in le plus récent pour l'utilisateur à la date du jour
    SELECT * INTO wellness_log_today
    FROM public.wellness_log
    WHERE user_id = user_id_param AND date = CURRENT_DATE
    ORDER BY created_at DESC
    LIMIT 1;

    -- Si aucun check-in n'est trouvé pour aujourd'hui, retourner 0
    IF NOT FOUND OR wellness_log_today.duree_sommeil_calculee IS NULL THEN
        RETURN 0;
    END IF;

    -- 1. Calcul du Score Sommeil
    score_duree := get_sleep_duration_score(wellness_log_today.duree_sommeil_calculee);
    score_sommeil := score_duree * (wellness_log_today.ressenti_sommeil / 100.0);

    -- 2. Normalisation et inversion des scores de fatigue et stress
    score_fatigue := 100 - wellness_log_today.muscle_fatigue;
    score_stress := 100 - wellness_log_today.stress_level;

    -- 3. Calcul de l'indice final pondéré
    final_indice := (score_sommeil * 0.4) + (score_fatigue * 0.4) + (score_stress * 0.2);

    RETURN final_indice;
END;
$$ LANGUAGE plpgsql;