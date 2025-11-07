/*
  # WELLNESS LOG TABLE REFACTOR
  
  1. Schema Changes
    - Rename `sleep_quality` to `ressenti_sommeil` (0-100 scale)
    - Add `heure_coucher` (bedtime as timestamptz)
    - Add `heure_lever` (wake up time as timestamptz)
    - Add `duree_sommeil_calculee` (calculated sleep duration in minutes)
    - Update constraints for `stress_level` and `muscle_fatigue` to 0-100 scale
    
  2. Security
    - Recreate RLS policies after schema changes
    - Maintain existing access patterns (users can manage their own data, coaches can read athlete data)
*/

-- 1. Drop existing policies to allow schema changes
DROP POLICY IF EXISTS "Users can manage their own wellness logs" ON public.wellness_log;
DROP POLICY IF EXISTS "Coaches can read wellness logs of their athletes" ON public.wellness_log;

-- 2. Rename 'sleep_quality' to 'ressenti_sommeil' and update its constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wellness_log' AND column_name = 'sleep_quality'
  ) THEN
    ALTER TABLE public.wellness_log RENAME COLUMN sleep_quality TO ressenti_sommeil;
  END IF;
END $$;

ALTER TABLE public.wellness_log
DROP CONSTRAINT IF EXISTS wellness_log_sleep_quality_check;

ALTER TABLE public.wellness_log
DROP CONSTRAINT IF EXISTS wellness_log_ressenti_sommeil_check;

ALTER TABLE public.wellness_log
ADD CONSTRAINT wellness_log_ressenti_sommeil_check CHECK (ressenti_sommeil >= 0 AND ressenti_sommeil <= 100);

-- 3. Update 'stress_level' and 'muscle_fatigue' constraints to be 0-100
ALTER TABLE public.wellness_log
DROP CONSTRAINT IF EXISTS wellness_log_stress_level_check;

ALTER TABLE public.wellness_log
ADD CONSTRAINT wellness_log_stress_level_check CHECK (stress_level >= 0 AND stress_level <= 100);

ALTER TABLE public.wellness_log
DROP CONSTRAINT IF EXISTS wellness_log_muscle_fatigue_check;

ALTER TABLE public.wellness_log
ADD CONSTRAINT wellness_log_muscle_fatigue_check CHECK (muscle_fatigue >= 0 AND muscle_fatigue <= 100);

-- 4. Add new columns for sleep tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wellness_log' AND column_name = 'heure_coucher'
  ) THEN
    ALTER TABLE public.wellness_log ADD COLUMN heure_coucher TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wellness_log' AND column_name = 'heure_lever'
  ) THEN
    ALTER TABLE public.wellness_log ADD COLUMN heure_lever TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wellness_log' AND column_name = 'duree_sommeil_calculee'
  ) THEN
    ALTER TABLE public.wellness_log ADD COLUMN duree_sommeil_calculee INT;
  END IF;
END $$;

-- 5. Recreate RLS policies
CREATE POLICY "Users can manage their own wellness logs"
ON public.wellness_log
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can read wellness logs of their athletes"
ON public.wellness_log
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM coach_athlete_links
        WHERE coach_id = auth.uid()
        AND athlete_id = wellness_log.user_id
        AND status = 'ACCEPTED'
    )
);