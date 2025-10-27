/*
  # Corriger l'accès des coachs aux profils des athlètes

  1. Problème identifié
    - Les coachs ne peuvent pas voir les profils de leurs athlètes
    - Les politiques RLS sur la table `profiles` sont trop restrictives
    - Seuls les utilisateurs peuvent voir leur propre profil

  2. Solution
    - Ajouter une politique permettant aux coachs de voir les profils de leurs athlètes
    - Maintenir la sécurité en limitant l'accès aux athlètes du coach uniquement

  3. Sécurité
    - Les coachs ne peuvent voir que les profils des athlètes dans leurs groupes
    - Les athlètes gardent le contrôle total de leur propre profil
    - Le développeur garde l'accès complet
*/

-- Supprimer l'ancienne politique restrictive si elle existe
DROP POLICY IF EXISTS "profiles_basic_access" ON profiles;

-- Politique pour que les utilisateurs puissent gérer leur propre profil
CREATE POLICY "Users can manage own profile"
  ON profiles
  FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Politique pour que les coachs puissent voir les profils de leurs athlètes
CREATE POLICY "Coaches can view their athletes profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    -- L'utilisateur peut voir son propre profil
    id = auth.uid()
    OR
    -- Un coach peut voir les profils des athlètes dans ses groupes
    EXISTS (
      SELECT 1 
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE gm.athlete_id = profiles.id
        AND g.coach_id = auth.uid()
    )
    OR
    -- Le développeur peut tout voir
    auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid
  );

-- Politique pour que seuls les propriétaires puissent modifier leur profil
CREATE POLICY "Users can update own profile only"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Politique pour que seuls les propriétaires puissent supprimer leur profil
CREATE POLICY "Users can delete own profile only"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());

-- Politique pour l'insertion (création de profil)
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());