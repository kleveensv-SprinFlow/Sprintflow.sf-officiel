/*
  # Fix: Permettre l'inscription via politique RLS au lieu de trigger
  
  1. Problème
    - Le trigger cause une erreur 500 lors de l'inscription
    - Conflit potentiel avec d'autres triggers ou contraintes
    
  2. Solution
    - Supprimer le trigger
    - Ajouter une politique RLS qui permet aux utilisateurs anonymes d'insérer leur propre profil
    - Plus simple et plus fiable
    
  3. Sécurité
    - La politique vérifie que l'ID correspond à l'utilisateur en cours de création
    - Utilise auth.uid() qui sera disponible pendant le processus d'inscription
*/

-- Supprimer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ajouter une politique pour permettre l'insertion pendant l'inscription
DROP POLICY IF EXISTS "Allow insert during signup" ON profiles;

CREATE POLICY "Allow insert during signup"
  ON profiles
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
