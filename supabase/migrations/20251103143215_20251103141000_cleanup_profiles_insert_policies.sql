/*
  # Nettoyage et simplification des politiques INSERT sur profiles

  1. Modifications
    - Supprime toutes les anciennes politiques INSERT redondantes
    - Crée UNE SEULE politique INSERT claire et efficace
    - La politique permet aux utilisateurs de créer leur propre profil lors de l'inscription
  
  2. Sécurité
    - La condition WITH CHECK vérifie que auth.uid() = id
    - Garantit qu'un utilisateur ne peut créer que son propre profil
*/

-- Supprimer toutes les anciennes politiques INSERT sur profiles
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "Anon can insert own profile during signup" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- Créer UNE SEULE politique INSERT claire
CREATE POLICY "Les utilisateurs peuvent créer leur propre profil"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
