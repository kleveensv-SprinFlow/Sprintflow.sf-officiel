-- Migration: 20251130100000_fix_visibility_and_relations.sql

-- 1. RECTIFICATION DES DROITS D'ACCÈS (RLS) SUR LES SÉANCES (WORKOUTS)

DROP POLICY IF EXISTS "workouts_full_access" ON workouts;
DROP POLICY IF EXISTS "workouts_read_access" ON workouts;
DROP POLICY IF EXISTS "workouts_insert_access" ON workouts;
DROP POLICY IF EXISTS "workouts_update_access" ON workouts;
DROP POLICY IF EXISTS "workouts_delete_access" ON workouts;
DROP POLICY IF EXISTS "workouts_write_access" ON workouts; -- Au cas où

-- A. LECTURE (Large)
CREATE POLICY "workouts_read_access" ON workouts FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR
  coach_id = auth.uid() OR
  assigned_to_user_id = auth.uid() OR
  assigned_to_group_id IN (SELECT group_id FROM group_members WHERE athlete_id = auth.uid())
);

-- B. GESTION TOTALE (Créateur / Coach)
CREATE POLICY "workouts_manager_access" ON workouts FOR ALL TO authenticated USING (
  user_id = auth.uid() OR
  coach_id = auth.uid()
);

-- C. MODIFICATION UNIQUEMENT (Athlète assigné)
-- Permet de valider/noter la séance, mais pas de la supprimer
CREATE POLICY "workouts_athlete_update" ON workouts FOR UPDATE TO authenticated USING (
  assigned_to_user_id = auth.uid()
) WITH CHECK (
  assigned_to_user_id = auth.uid()
);


-- 2. CORRECTION DE LA RELATION RECORDS -> EXERCICES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'records' AND column_name = 'exercice_personnalise_id') THEN
    ALTER TABLE records ADD COLUMN exercice_personnalise_id UUID REFERENCES exercices_personnalises(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_records_exercice_perso ON records(exercice_personnalise_id);


-- 3. VISIBILITÉ BIBLIOTHÈQUE (Utilisation de creator_id)
DROP POLICY IF EXISTS "Users can view own custom exercises" ON exercices_personnalises;
DROP POLICY IF EXISTS "Users can view relevant custom exercises" ON exercices_personnalises;

CREATE POLICY "Users can view relevant custom exercises" ON exercices_personnalises FOR SELECT TO authenticated USING (
  -- Je suis le créateur
  creator_id = auth.uid()
  OR
  -- OU l'exercice a été créé par un de mes coachs actifs
  EXISTS (
    SELECT 1 FROM coach_athlete_links
    WHERE coach_id = exercices_personnalises.creator_id  -- <-- Correction ici (creator_id)
    AND athlete_id = auth.uid()
    AND status = 'active'
  )
);
