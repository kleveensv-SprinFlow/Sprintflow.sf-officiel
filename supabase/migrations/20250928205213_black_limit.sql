/*
  # Fix group members visibility for athletes

  1. Security Updates
    - Update RLS policies to allow athletes to see all group members
    - Ensure proper visibility within groups
  
  2. Policy Changes
    - Allow athletes to read all members of their groups
    - Maintain security while improving visibility
*/

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "group_members_athlete_access" ON group_members;
DROP POLICY IF EXISTS "group_members_athlete_join" ON group_members;
DROP POLICY IF EXISTS "group_members_athlete_leave" ON group_members;

-- Nouvelle politique pour permettre aux athlètes de voir tous les membres de leurs groupes
CREATE POLICY "Athletes can see all members of their groups"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id 
      FROM group_members 
      WHERE athlete_id = auth.uid()
    )
  );

-- Politique pour permettre aux athlètes de rejoindre des groupes
CREATE POLICY "Athletes can join groups"
  ON group_members
  FOR INSERT
  TO authenticated
  WITH CHECK (athlete_id = auth.uid());

-- Politique pour permettre aux athlètes de quitter leurs groupes
CREATE POLICY "Athletes can leave their groups"
  ON group_members
  FOR DELETE
  TO authenticated
  USING (athlete_id = auth.uid());

-- Politique pour les coachs (inchangée)
CREATE POLICY "Coaches can manage their group members"
  ON group_members
  FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = auth.uid()
    )
  )
  WITH CHECK (
    group_id IN (
      SELECT id 
      FROM groups 
      WHERE coach_id = auth.uid()
    )
  );

-- Mettre à jour la politique des profils pour permettre la visibilité des membres
DROP POLICY IF EXISTS "Allow group members to view profiles" ON profiles;

CREATE POLICY "Group members can see each other's profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- L'utilisateur peut voir son propre profil
    id = auth.uid()
    OR
    -- L'utilisateur peut voir les profils des membres de ses groupes
    id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT group_id 
        FROM group_members 
        WHERE athlete_id = auth.uid()
      )
    )
    OR
    -- L'utilisateur peut voir les profils des coachs de ses groupes
    id IN (
      SELECT g.coach_id
      FROM groups g
      WHERE g.id IN (
        SELECT group_id 
        FROM group_members 
        WHERE athlete_id = auth.uid()
      )
    )
    OR
    -- Les coachs peuvent voir les profils de leurs athlètes
    id IN (
      SELECT gm.athlete_id
      FROM group_members gm
      WHERE gm.group_id IN (
        SELECT id 
        FROM groups 
        WHERE coach_id = auth.uid()
      )
    )
  );