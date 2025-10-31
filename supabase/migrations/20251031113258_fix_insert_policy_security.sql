/*
  # Fix: Sécuriser la politique d'insertion de profil
  
  1. Problème
    - La politique actuelle permet à n'importe qui d'insérer n'importe quel profil
    - WITH CHECK (true) est trop permissif
    
  2. Solution
    - Vérifier que l'utilisateur ne peut créer QUE son propre profil
    - L'ID inséré doit correspondre à auth.uid()
    
  3. Sécurité
    - Empêche la création de profils pour d'autres utilisateurs
    - Maintient la possibilité d'insertion pendant le signup
*/

-- Supprimer l'ancienne politique trop permissive
DROP POLICY IF EXISTS "Allow insert during signup" ON profiles;

-- Créer une politique sécurisée
CREATE POLICY "Users can insert own profile during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
