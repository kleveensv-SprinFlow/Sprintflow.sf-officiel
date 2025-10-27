/*
  # Corriger l'accès des coachs aux données des athlètes

  1. Politiques mises à jour
    - `records` : Permettre aux coachs de voir les records de leurs athlètes
    - `workouts` : Permettre aux coachs de voir les entraînements de leurs athlètes  
    - `body_compositions` : Permettre aux coachs de voir la composition corporelle de leurs athlètes
    - `profiles` : Maintenir l'accès existant

  2. Sécurité
    - Les coachs ne voient que les données de leurs propres athlètes (via group_members)
    - Les athlètes gardent le contrôle total de leurs données
    - Le développeur garde l'accès complet

  3. Logique d'accès
    - Coach peut voir les données d'un athlète SI cet athlète est dans un de ses groupes
    - Utilisation de la table `group_members` comme pont de sécurité
*/

-- Politique pour les records : permettre aux coachs de voir les records de leurs athlètes
DROP POLICY IF EXISTS "records_user_access" ON records;
DROP POLICY IF EXISTS "records_coach_access" ON records;

CREATE POLICY "records_user_access"
  ON records
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "records_coach_access"
  ON records
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- Politique pour les workouts : permettre aux coachs de voir les entraînements de leurs athlètes
DROP POLICY IF EXISTS "workouts_user_access" ON workouts;
DROP POLICY IF EXISTS "workouts_coach_access" ON workouts;

CREATE POLICY "workouts_user_access"
  ON workouts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workouts_coach_access"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- Politique pour les body_compositions : permettre aux coachs de voir la composition corporelle de leurs athlètes
DROP POLICY IF EXISTS "body_compositions_user_access" ON body_compositions;
DROP POLICY IF EXISTS "body_compositions_coach_access" ON body_compositions;

CREATE POLICY "body_compositions_user_access"
  ON body_compositions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "body_compositions_coach_access"
  ON body_compositions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    )
  );

-- Politique pour les profiles : maintenir l'accès existant et ajouter l'accès coach
-- (Cette politique existe déjà mais on la recrée pour être sûr)
DROP POLICY IF EXISTS "Coaches can view their athletes profiles" ON profiles;

CREATE POLICY "Coaches can view their athletes profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.coach_id = auth.uid()
    ) OR 
    auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid
  );