-- Upgrade Schema for Coach Command Center (Cockpit)

-- 1. Injury Logs: Add Status
ALTER TABLE public.injury_logs 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'recovered', 'closed')) DEFAULT 'active';

-- 2. Workouts: Add Planned RPE & Review Status
ALTER TABLE public.workouts 
ADD COLUMN IF NOT EXISTS planned_rpe INTEGER CHECK (planned_rpe BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS is_reviewed BOOLEAN DEFAULT FALSE;

-- 3. Backfill Planned RPE based on Tag Seance
UPDATE public.workouts 
SET planned_rpe = CASE 
    WHEN tag_seance IN ('vitesse_max', 'endurance_lactique') THEN 8
    WHEN tag_seance = 'technique_recup' THEN 3
    ELSE 5
END
WHERE planned_rpe IS NULL;

-- 4. Enable RLS for new columns (inherited from table, but good to verify policies don't block updates)
-- Existing policies should cover UPDATE if they allow updating the row.

-- 5. Create index for performance on Command Center queries
CREATE INDEX IF NOT EXISTS idx_injury_logs_status ON public.injury_logs(status);
CREATE INDEX IF NOT EXISTS idx_workouts_is_reviewed ON public.workouts(is_reviewed);
CREATE INDEX IF NOT EXISTS idx_workouts_planned_rpe ON public.workouts(planned_rpe);
