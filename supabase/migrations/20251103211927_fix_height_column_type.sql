/*
  # Correction du type de la colonne height

  1. Problème
    - La colonne `height` est de type `double precision` au lieu de `integer`
    - Cela peut causer des problèmes lors des updates depuis le frontend
  
  2. Solution
    - Changer le type de `height` en `integer`
    - Garder les données existantes en les convertissant
*/

-- Changer le type de height de double precision vers integer
ALTER TABLE profiles 
ALTER COLUMN height TYPE integer 
USING height::integer;
