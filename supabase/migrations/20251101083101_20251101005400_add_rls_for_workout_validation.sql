DROP POLICY IF EXISTS "Coaches can validate completed workouts" ON public.workouts;

CREATE POLICY "Coaches can validate completed workouts"
  ON public.workouts
  FOR UPDATE
  TO authenticated
  USING (
    is_coach_of_athlete(workouts.user_id)
    AND workouts.status = 'completed'
  )
  WITH CHECK (
    is_coach_of_athlete(workouts.user_id)
  );