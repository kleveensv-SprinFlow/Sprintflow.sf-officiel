/*
  # Nettoyage COMPLET des politiques profiles

  1. Problème
    - Timeout de 5 secondes sur les requêtes SELECT
    - Trop de politiques complexes qui peuvent se bloquer mutuellement
    - Possible récursion ou deadlock

  2. Solution
    - SUPPRIMER TOUTES les politiques SELECT existantes
    - Recréer UNIQUEMENT la politique de base ultra-simple
    - Tester si ça résout le timeout

  3. Sécurité
    - On garde quand même la sécurité de base (lecture de son propre profil)
    - On pourra ajouter les autres politiques une par une après avoir confirmé que ça marche
*/

-- Supprimer TOUTES les politiques SELECT existantes
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can read athlete profiles" ON profiles;
DROP POLICY IF EXISTS "Group members can read each other profiles" ON profiles;
DROP POLICY IF EXISTS "Group members can read each other profiles simple" ON profiles;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir et modifier leur propre profil" ON profiles;

-- Créer UNE SEULE politique ultra-simple pour tester
CREATE POLICY "Allow user to read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Log pour debug
DO $$
BEGIN
  RAISE NOTICE 'Politiques profiles nettoyées et recréées';
END $$;
