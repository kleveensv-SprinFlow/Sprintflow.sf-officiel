-- Create training_phases table
CREATE TABLE IF NOT EXISTS public.training_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    type TEXT, -- e.g., 'volume', 'intensite', etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    color TEXT,
    group_id UUID REFERENCES public.groups(id),
    athlete_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT check_target CHECK (group_id IS NOT NULL OR athlete_id IS NOT NULL),
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE public.training_phases ENABLE ROW LEVEL SECURITY;

-- Coach can do everything on their own rows
CREATE POLICY "Coaches can manage their own training phases"
    ON public.training_phases
    FOR ALL
    USING (auth.uid() = coach_id);

-- Athletes can read phases assigned to them directly
CREATE POLICY "Athletes can read their own training phases"
    ON public.training_phases
    FOR SELECT
    USING (auth.uid() = athlete_id);

-- Athletes can read phases assigned to their groups
CREATE POLICY "Athletes can read training phases of their groups"
    ON public.training_phases
    FOR SELECT
    USING (
        group_id IN (
            SELECT group_id
            FROM public.group_members
            WHERE athlete_id = auth.uid()
        )
    );
