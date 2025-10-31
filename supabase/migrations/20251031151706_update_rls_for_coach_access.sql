/******************************************************************
** Description: Updates Row Level Security (RLS) policies to grant coaches read access
**              to their athletes' data across multiple tables. This migration uses the
**              `is_coach_of_athlete` helper function to simplify and secure the policies.
**
** Changes:
**   1. `records`: Update SELECT policy to allow coach access.
**   2. `workouts`: Update SELECT policy to allow coach access.
**   3. `donnees_corporelles`: Update SELECT policy to allow coach access.
**   4. `video_analysis_logs`: Update SELECT policy to allow unconditional coach access,
**      removing the dependency on the `shared_with_coach` flag.
******************************************************************/

-- 1. Update RLS policy for the 'records' table
-- Drop the old policy first to avoid conflicts
DROP POLICY IF EXISTS "records_full_access" ON public.records;
-- Create a new policy that grants access to the athlete owner OR their coach
CREATE POLICY "Allow athlete and coach access to records"
  ON public.records
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_coach_of_athlete(user_id)
  );

-- 2. Update RLS policy for the 'workouts' table
-- Drop the old policy
DROP POLICY IF EXISTS "workouts_full_access" ON public.workouts;
-- Create a new policy for athlete owner OR their coach
CREATE POLICY "Allow athlete and coach access to workouts"
  ON public.workouts
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_coach_of_athlete(user_id)
  );

-- 3. Update RLS policy for the 'donnees_corporelles' table
-- Drop the old policy
DROP POLICY IF EXISTS "Athletes can manage own body data" ON public.donnees_corporelles;
-- Recreate the policy for ALL operations for the athlete to keep their permissions
CREATE POLICY "Athletes can manage their own body data"
  ON public.donnees_corporelles
  FOR ALL
  TO authenticated
  USING (athlete_id = auth.uid())
  WITH CHECK (athlete_id = auth.uid());
-- Add a new, separate policy for coach read access
CREATE POLICY "Coaches can view their athletes body data"
  ON public.donnees_corporelles
  FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(athlete_id));

-- 4. Update RLS policies for the 'video_analysis_logs' table
-- Drop the old, conditional coach policy
DROP POLICY IF EXISTS "Coaches can view shared analysis logs of their athletes" ON public.video_analysis_logs;
-- Drop the athlete-only policy to recreate it with the coach access rule
DROP POLICY IF EXISTS "Athletes can manage their own analysis logs" ON public.video_analysis_logs;
-- Create a new policy for ALL operations for the athlete
CREATE POLICY "Athletes can manage their own analysis logs"
  ON public.video_analysis_logs
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
-- Create a new policy for coach read access, no longer conditional on 'shared_with_coach'
CREATE POLICY "Coaches can view their athletes analysis logs"
  ON public.video_analysis_logs
  FOR SELECT
  TO authenticated
  USING (is_coach_of_athlete(user_id));
