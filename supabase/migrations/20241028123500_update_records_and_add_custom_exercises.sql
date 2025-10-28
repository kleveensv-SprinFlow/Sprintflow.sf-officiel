-- Create the table for custom exercises
CREATE TABLE exercices_personnalises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES auth.users(id),
    nom TEXT NOT NULL,
    qualite_cible TEXT NOT NULL,
    exercice_reference_id UUID NOT NULL REFERENCES exercices_reference(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add foreign key columns to the records table
ALTER TABLE records
ADD COLUMN exercice_reference_id UUID REFERENCES exercices_reference(id),
ADD COLUMN exercice_personnalise_id UUID REFERENCES exercices_personnalises(id);

-- Add a constraint to ensure that a record is linked to one type of exercise
ALTER TABLE records
ADD CONSTRAINT chk_record_exercise_link CHECK (
    (exercice_reference_id IS NOT NULL AND exercice_personnalise_id IS NULL) OR
    (exercice_reference_id IS NULL AND exercice_personnalise_id IS NOT NULL)
);

-- Remove the old free-text exercise name column
ALTER TABLE records
DROP COLUMN exercise_name;

-- Add indexes for performance
CREATE INDEX idx_exercices_personnalises_athlete_id ON exercices_personnalises(athlete_id);
CREATE INDEX idx_records_exercice_reference_id ON records(exercice_reference_id);
CREATE INDEX idx_records_exercice_personnalise_id ON records(exercice_personnalise_id);