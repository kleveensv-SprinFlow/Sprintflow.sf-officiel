/*
  # Nettoyage des politiques profiles redondantes

  1. Problème
    - Trop de politiques qui peuvent causer des conflits
    - Une politique "ALL" qui entre en conflit avec les autres
    - Possibles récursions ou problèmes de performance

  2. Solution
    - Supprimer la politique "ALL" redondante
    - Garder uniquement les politiques spécifiques et simples
    - Simplifier la politique des groupes
*/

-- Supprimer la politique ALL redondante
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir et modifier leur propre profil" ON profiles;

-- Simplifier la politique des groupes (supprimer temporairement pour debug)
DROP POLICY IF EXISTS "Group members can read each other profiles" ON profiles;

-- Recréer une version plus simple de la politique des groupes
CREATE POLICY "Group members can read each other profiles simple"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT gm2.athlete_id 
      FROM group_members gm1
      JOIN group_members gm2 ON gm1.group_id = gm2.group_id
      WHERE gm1.athlete_id = auth.uid()
    )
  );
