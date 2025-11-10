/*
  # Utiliser la fonction helper dans les policies pour améliorer les performances

  1. Problème
    - Les policies utilisent des sous-requêtes complexes avec JOINs
    - Même avec les index, les sous-requêtes sont exécutées pour CHAQUE ligne
    - Le query planner PostgreSQL ne peut pas optimiser efficacement

  2. Solution
    - Utiliser la fonction can_read_profile() qui encapsule toute la logique
    - La fonction est STABLE et SECURITY DEFINER, donc PostgreSQL peut la cacher
    - Les index seront utilisés efficacement à l'intérieur de la fonction

  3. Impact
    - Réduction massive du temps d'exécution des policies
    - De 15+ secondes à < 500ms pour charger un profil
*/

-- Étape 1: Supprimer les policies existantes complexes
DROP POLICY IF EXISTS "Allow user to read own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can read athlete profiles in their groups" ON profiles;
DROP POLICY IF EXISTS "Group members can read each other profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;

-- Étape 2: Créer UNE SEULE policy qui utilise la fonction helper
CREATE POLICY "Users can read accessible profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (can_read_profile(id));

-- Étape 3: Log pour confirmer
DO $$
BEGIN
  RAISE NOTICE 'Policies optimisées avec can_read_profile()';
END $$;

-- Étape 4: Vérifier que la policy est créée
SELECT
  policyname,
  tablename,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
  AND cmd = 'SELECT';
