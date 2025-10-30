-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the coach_athlete_links table
CREATE TABLE coach_athlete_links (
    coach_id UUID NOT NULL REFERENCES profiles(id),
    athlete_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (coach_id, athlete_id)
);

-- Create the workout_templates table
CREATE TABLE workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    name TEXT NOT NULL,
    structure_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the block_templates table
CREATE TABLE block_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    name TEXT NOT NULL,
    block_type TEXT NOT NULL CHECK (block_type IN ('course', 'muscu', 'text')),
    block_data_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create the wellness_log table
CREATE TABLE wellness_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    date DATE NOT NULL,
    sleep_quality INT CHECK (sleep_quality BETWEEN 1 AND 5),
    stress_level INT CHECK (stress_level BETWEEN 1 AND 5),
    muscle_fatigue INT CHECK (muscle_fatigue BETWEEN 1 AND 5),
    rpe_difficulty INT CHECK (rpe_difficulty BETWEEN 1 AND 10),
    workout_id UUID REFERENCES workouts(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Add columns to workouts table
ALTER TABLE workouts
ADD COLUMN is_planified BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN planned_by_coach_id UUID REFERENCES profiles(id);

-- RLS Policies

-- For coach_athlete_links
ALTER TABLE coach_athlete_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own links"
ON coach_athlete_links
FOR SELECT
USING (auth.uid() = coach_id OR auth.uid() = athlete_id);

CREATE POLICY "Coaches can create links"
ON coach_athlete_links
FOR INSERT
WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Athletes can update link status"
ON coach_athlete_links
FOR UPDATE
USING (auth.uid() = athlete_id)
WITH CHECK (status IN ('ACCEPTED', 'REJECTED'));

-- For workout_templates
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates"
ON workout_templates
FOR ALL
USING (auth.uid() = user_id);

-- For block_templates
ALTER TABLE block_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own block templates"
ON block_templates
FOR ALL
USING (auth.uid() = user_id);

-- For wellness_log
ALTER TABLE wellness_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own wellness logs"
ON wellness_log
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Coaches can read wellness logs of their athletes"
ON wellness_log
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM coach_athlete_links
        WHERE coach_id = auth.uid()
        AND athlete_id = wellness_log.user_id
        AND status = 'ACCEPTED'
    )
);

-- For workouts
CREATE POLICY "Coaches can insert workouts for their athletes"
ON workouts
FOR INSERT
WITH CHECK (
    is_planified = TRUE AND
    planned_by_coach_id = auth.uid() AND
    EXISTS (
        SELECT 1
        FROM coach_athlete_links
        WHERE coach_id = auth.uid()
        AND athlete_id = workouts.user_id
        AND status = 'ACCEPTED'
    )
);

CREATE POLICY "Coaches can read workouts of their athletes"
ON workouts
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM coach_athlete_links
        WHERE coach_id = auth.uid()
        AND athlete_id = workouts.user_id
        AND status = 'ACCEPTED'
    )
);

-- For records
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coaches can read records of their athletes"
ON records
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM coach_athlete_links
        WHERE coach_id = auth.uid()
        AND athlete_id = records.user_id
        AND status = 'ACCEPTED'
    )
);
