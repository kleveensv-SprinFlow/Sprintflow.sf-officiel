/*
  # Correction urgente : Politiques RLS manquantes pour profiles

  1. Problème critique
    - RLS activé sur profiles mais AUCUNE politique SELECT
    - Les utilisateurs ne peuvent pas lire leur propre profil
    - Cause des timeouts et chargement infini

  2. Solution
    - Créer les politiques SELECT pour lecture
    - Créer les politiques UPDATE pour modification
    - Créer les politiques DELETE pour suppression

  3. Sécurité
    - Chaque utilisateur peut SEULEMENT lire/modifier son propre profil
    - Les coaches peuvent lire les profils de leurs athlètes
*/

-- Politique SELECT : Utilisateurs peuvent lire leur propre profil
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Politique SELECT : Coaches peuvent lire les profils de leurs athlètes
CREATE POLICY "Coaches can read athlete profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM coach_athlete_links
      WHERE coach_athlete_links.coach_id = auth.uid()
      AND coach_athlete_links.athlete_id = profiles.id
    )
  );

-- Politique SELECT : Membres d'un groupe peuvent se voir entre eux
CREATE POLICY "Group members can read each other profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
      AND gm2.athlete_id = profiles.id
    )
  );

-- Politique UPDATE : Utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique DELETE : Utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
