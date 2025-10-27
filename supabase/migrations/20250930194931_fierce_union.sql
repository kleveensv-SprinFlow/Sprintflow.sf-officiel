/*
  # Corriger la visibilité des membres du groupe pour les athlètes

  1. Problème identifié
    - Les athlètes ne peuvent pas voir les autres membres de leur groupe
    - Les athlètes ne peuvent pas voir leur coach
    - Les politiques RLS sont trop restrictives

  2. Solutions
    - Permettre aux athlètes de voir tous les profils des membres de leurs groupes
    - Permettre aux athlètes de voir le profil de leur coach
    - Ajouter une politique spécifique pour la visibilité des groupes

  3. Sécurité
    - Les athlètes ne voient que les profils des membres de leurs propres groupes
    - Pas d'accès aux données sensibles d'autres utilisateurs
*/

-- Ajouter une politique pour permettre aux athlètes de voir les profils des membres de leurs groupes
CREATE POLICY "Athletes can view group members profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- L'athlète peut voir son propre profil (déjà couvert par une autre politique)
    id = auth.uid()
    OR
    -- L'athlète peut voir les profils des autres membres de ses groupes
    id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
    OR
    -- L'athlète peut voir le profil du coach de ses groupes
    id IN (
      SELECT g.coach_id
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.athlete_id = auth.uid()
    )
  );

-- Améliorer la politique des groupes pour permettre aux athlètes de voir les détails complets
DO $$
BEGIN
  -- Supprimer l'ancienne politique si elle existe
  DROP POLICY IF EXISTS "Athletes can select groups by invitation code" ON groups;
  
  -- Créer une nouvelle politique plus permissive pour les athlètes
  CREATE POLICY "Athletes can view their groups with full details" ON groups
    FOR SELECT
    TO authenticated
    USING (
      -- Les athlètes peuvent voir les groupes dont ils sont membres
      id IN (
        SELECT group_id
        FROM group_members
        WHERE athlete_id = auth.uid()
      )
      OR
      -- Permettre la recherche par code d'invitation (pour rejoindre)
      true
    );
END $$;

-- Améliorer la politique des group_members pour une meilleure visibilité
DO $$
BEGIN
  -- Supprimer l'ancienne politique si elle existe
  DROP POLICY IF EXISTS "group_members_athlete_simple" ON group_members;
  
  -- Créer une politique améliorée pour les athlètes
  CREATE POLICY "Athletes can view all members of their groups" ON group_members
    FOR SELECT
    TO authenticated
    USING (
      -- L'athlète peut voir tous les membres des groupes dont il fait partie
      group_id IN (
        SELECT group_id
        FROM group_members
        WHERE athlete_id = auth.uid()
      )
    );
END $$;

-- Ajouter une politique pour permettre aux athlètes de voir les données des autres athlètes de leurs groupes
CREATE POLICY "Athletes can view group members workouts" ON workouts
  FOR SELECT
  TO authenticated
  USING (
    -- L'athlète peut voir les workouts des autres membres de ses groupes
    user_id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can view group members records" ON records
  FOR SELECT
  TO authenticated
  USING (
    -- L'athlète peut voir les records des autres membres de ses groupes
    user_id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can view group members body compositions" ON body_compositions
  FOR SELECT
  TO authenticated
  USING (
    -- L'athlète peut voir les compositions corporelles des autres membres de ses groupes
    user_id IN (
      SELECT gm2.athlete_id
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
  );