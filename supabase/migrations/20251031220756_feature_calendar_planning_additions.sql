/*
  # Calendar Planning Feature - Additions
  
  1. Changes to 'workouts' table
    - Add 'status' column (planned, completed, missed)
    - Add 'scheduled_date' column for planning
    - Add 'assigned_to_user_id' for individual assignments
    - Add 'assigned_to_group_id' for group assignments
    - Add 'coach_id' to track who created the workout
    - Add 'rpe' for Rate of Perceived Exertion
    - Add 'planned_data' to store original coach plan
    - Add 'workout_data' as alias to existing data columns
    
  2. Security Updates
    - Add policies for calendar planning features
    - Allow athletes to view assigned workouts
    - Allow coaches to view their athletes' workouts
    - Allow athletes to update planned workouts
*/

-- Add new columns to workouts table (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'status') THEN
    ALTER TABLE public.workouts ADD COLUMN status TEXT DEFAULT 'completed' NOT NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'scheduled_date') THEN
    ALTER TABLE public.workouts ADD COLUMN scheduled_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'assigned_to_user_id') THEN
    ALTER TABLE public.workouts ADD COLUMN assigned_to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'assigned_to_group_id') THEN
    ALTER TABLE public.workouts ADD COLUMN assigned_to_group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'coach_id') THEN
    ALTER TABLE public.workouts ADD COLUMN coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'rpe') THEN
    ALTER TABLE public.workouts ADD COLUMN rpe SMALLINT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'planned_data') THEN
    ALTER TABLE public.workouts ADD COLUMN planned_data JSONB;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workouts' AND column_name = 'workout_data') THEN
    ALTER TABLE public.workouts ADD COLUMN workout_data JSONB;
  END IF;
END $$;

-- Add comments to clarify usage
COMMENT ON COLUMN public.workouts.workout_data IS 'Contient les performances réelles de l''athlète.';
COMMENT ON COLUMN public.workouts.planned_data IS 'Contient le plan original créé par le coach.';
COMMENT ON COLUMN public.workouts.status IS 'Status: planned, completed, missed';

-- Add new policies for calendar planning
DROP POLICY IF EXISTS "Les athlètes peuvent voir les séances qui leur sont assignées ou assignées à leur groupe" ON public.workouts;
CREATE POLICY "Athletes can view assigned workouts"
  ON public.workouts
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    assigned_to_user_id = auth.uid() OR
    assigned_to_group_id IN (SELECT group_id FROM public.group_members WHERE athlete_id = auth.uid())
  );

DROP POLICY IF EXISTS "Les coachs peuvent voir les séances de leurs athlètes et leurs planifications" ON public.workouts;
CREATE POLICY "Coaches can view their athletes workouts"
  ON public.workouts
  FOR SELECT
  TO authenticated
  USING (
    coach_id = auth.uid() OR
    planned_by_coach_id = auth.uid() OR
    is_coach_of_athlete(user_id)
  );

DROP POLICY IF EXISTS "Les athlètes peuvent mettre à jour leurs séances planifiées" ON public.workouts;
CREATE POLICY "Athletes can update planned workouts"
  ON public.workouts
  FOR UPDATE
  TO authenticated
  USING (
    (user_id = auth.uid() OR assigned_to_user_id = auth.uid()) 
    AND status = 'planned'
  )
  WITH CHECK (user_id = auth.uid());

-- Add policy for coaches to create planned workouts
DROP POLICY IF EXISTS "Coaches can create planned workouts" ON public.workouts;
CREATE POLICY "Coaches can create planned workouts"
  ON public.workouts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    coach_id = auth.uid() AND status = 'planned'
  );
