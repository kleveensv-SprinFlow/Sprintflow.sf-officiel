/*
  # Ajouter politique d'insertion pour anon pendant signup
  
  1. Problème potentiel
    - Pendant signUp(), l'utilisateur pourrait être encore 'anon' au moment de l'INSERT
    - La politique actuelle ne permet qu'à 'authenticated'
    
  2. Solution
    - Ajouter une politique permettant à 'anon' d'insérer son profil
    - Garder la vérification auth.uid() = id pour la sécurité
    
  3. Sécurité
    - Même avec anon, on vérifie que l'ID correspond à l'utilisateur
*/

-- Ajouter politique pour anon
CREATE POLICY "Anon can insert own profile during signup"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (auth.uid() = id);
