/*
  # Suppression de la colonne avatar_url redondante

  ## Changements
  
  1. Migration des données
    - Copier les données de `avatar_url` vers `photo_url` si `photo_url` est NULL
  
  2. Suppression de colonne
    - Supprimer la colonne `avatar_url` de la table `profiles`
  
  ## Notes importantes
  
  - Cette migration harmonise le stockage des photos de profil
  - Toute l'application utilisera désormais uniquement `photo_url`
  - Les données existantes dans `avatar_url` sont préservées en les copiant vers `photo_url`
*/

-- Étape 1: Copier les données de avatar_url vers photo_url si photo_url est NULL
UPDATE profiles
SET photo_url = avatar_url
WHERE photo_url IS NULL AND avatar_url IS NOT NULL;

-- Étape 2: Supprimer la colonne avatar_url
ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;
