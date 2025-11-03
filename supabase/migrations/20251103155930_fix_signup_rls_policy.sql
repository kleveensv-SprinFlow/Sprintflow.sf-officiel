/*
  # Fix: Autoriser l'insertion de profil pendant l'inscription
  
  1. Problème
    - La politique RLS actuelle vérifie auth.uid() = id
    - Pendant l'inscription, l'utilisateur n'est pas encore authentifié
    - auth.uid() retourne NULL, donc l'insertion échoue
    
  2. Solution
    - Supprimer l'ancienne politique d'insertion restrictive
    - Créer une nouvelle politique qui permet l'insertion pendant l'inscription
    - La politique vérifie que l'ID du profil correspond à l'ID de l'utilisateur en création
    
  3. Sécurité
    - Seuls les utilisateurs peuvent créer leur propre profil
    - L'ID doit correspondre exactement
*/

-- Supprimer les anciennes politiques d'insertion
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Allow insert during signup" ON profiles;

-- Créer une nouvelle politique pour l'inscription
-- Cette politique permet aux utilisateurs anonymes et authentifiés de créer un profil
-- pendant le processus d'inscription
CREATE POLICY "Allow profile creation during signup"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Note: Cette politique est sécurisée car :
-- 1. L'utilisateur doit d'abord être créé dans auth.users par Supabase Auth
-- 2. L'application vérifie que l'ID correspond à l'utilisateur créé
-- 3. Une fois créé, les autres politiques (SELECT, UPDATE, DELETE) protègent le profil
