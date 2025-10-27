/*
  # Permettre aux coachs de voir les données de leurs athlètes

  1. Modifications de sécurité
    - Mise à jour des politiques RLS pour `records`
    - Mise à jour des politiques RLS pour `body_compositions`
    - Mise à jour des politiques RLS pour `workouts`
    - Permettre aux coachs de voir les données des athlètes de leurs groupes

  2. Nouvelles politiques
    - Les coachs peuvent voir les records de leurs athlètes
    - Les coachs peuvent voir les compositions corporelles de leurs athlètes
    - Les coachs peuvent voir les workouts de leurs athlètes
*/

-- Politique pour permettre aux coachs de voir les records de leurs athlètes
DROP POLICY IF EXISTS "records_policy" ON records;

CREATE POLICY "records_policy" ON records
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      WHERE g.coach_id = auth.uid()
    )
  )
  WITH CHECK (user_id = auth.uid());

-- Politique pour permettre aux coachs de voir les compositions corporelles de leurs athlètes
DROP POLICY IF EXISTS "body_compositions_policy" ON body_compositions;

CREATE POLICY "body_compositions_policy" ON body_compositions
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      WHERE g.coach_id = auth.uid()
    )
  )
  WITH CHECK (user_id = auth.uid());

-- Politique pour permettre aux coachs de voir les workouts de leurs athlètes
DROP POLICY IF EXISTS "workouts_policy" ON workouts;

CREATE POLICY "workouts_policy" ON workouts
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      WHERE g.coach_id = auth.uid()
    )
  )
  WITH CHECK (user_id = auth.uid());