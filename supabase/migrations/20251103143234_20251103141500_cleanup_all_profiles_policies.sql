/*
  # Nettoyage complet des politiques RLS sur profiles

  1. Modifications
    - Supprime toutes les politiques en double sur profiles
    - Conserve uniquement les politiques essentielles et bien nommées
  
  2. Politiques finales
    - INSERT: Les utilisateurs peuvent créer leur propre profil
    - SELECT: Les utilisateurs peuvent lire leur propre profil
    - SELECT: Les coachs peuvent lire les profils de leurs athlètes
    - UPDATE: Les utilisateurs peuvent mettre à jour leur propre profil
*/

-- Supprimer les politiques en double pour SELECT
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;

-- Supprimer les politiques en double pour UPDATE
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Créer les politiques propres
CREATE POLICY "Les utilisateurs peuvent lire leur propre profil"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
