create table if not exists public.wellness_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  ressenti_sommeil integer check (ressenti_sommeil between 0 and 100),
  stress_level integer check (stress_level between 0 and 100),
  muscle_fatigue integer check (muscle_fatigue between 0 and 100),
  energie_subjective integer check (energie_subjective between 0 and 100),
  humeur_subjective integer check (humeur_subjective between 0 and 100),
  menstruations boolean default false,
  heure_coucher timestamp with time zone,
  heure_lever timestamp with time zone,
  duree_sommeil_calculee integer,
  rpe_difficulty integer check (rpe_difficulty between 0 and 10),
  workout_id uuid references public.workouts(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, date)
);

comment on table public.wellness_log is 'Logs quotidiens de bien-être (sommeil, stress, fatigue, énergie, humeur, cycle)';

-- Add RLS policies if not already present (idempotent)
alter table public.wellness_log enable row level security;

create policy "Users can view their own wellness logs"
  on public.wellness_log for select
  using (auth.uid() = user_id);

create policy "Users can insert their own wellness logs"
  on public.wellness_log for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own wellness logs"
  on public.wellness_log for update
  using (auth.uid() = user_id);

create policy "Coaches can view their athletes' wellness logs"
  on public.wellness_log for select
  using (
    exists (
      select 1 from public.coach_athlete_links
      where coach_id = auth.uid()
      and athlete_id = wellness_log.user_id
    )
  );
