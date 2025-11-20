/*
  # Add detailed wellness columns
  
  1. Changes
    - Add `energie_subjective` column (0-100)
    - Add `humeur_subjective` column (0-100)
    - Add `menstruations` column (boolean)
    - Add check constraints for the new integer columns
*/

DO $$
BEGIN
  -- Add energie_subjective
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wellness_log' AND column_name = 'energie_subjective'
  ) THEN
    ALTER TABLE public.wellness_log ADD COLUMN energie_subjective INT;
    ALTER TABLE public.wellness_log ADD CONSTRAINT wellness_log_energie_subjective_check CHECK (energie_subjective >= 0 AND energie_subjective <= 100);
  END IF;

  -- Add humeur_subjective
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wellness_log' AND column_name = 'humeur_subjective'
  ) THEN
    ALTER TABLE public.wellness_log ADD COLUMN humeur_subjective INT;
    ALTER TABLE public.wellness_log ADD CONSTRAINT wellness_log_humeur_subjective_check CHECK (humeur_subjective >= 0 AND humeur_subjective <= 100);
  END IF;

  -- Add menstruations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wellness_log' AND column_name = 'menstruations'
  ) THEN
    ALTER TABLE public.wellness_log ADD COLUMN menstruations BOOLEAN DEFAULT FALSE;
  END IF;

END $$;
