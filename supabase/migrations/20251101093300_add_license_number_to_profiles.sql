/*
  # Ajout des colonnes license_number et height au profil

  1. Modifications
    - Ajoute `license_number` (TEXT) pour stocker le numéro de licence
    - Ajoute `height` (INTEGER) pour stocker la taille en cm

  2. Notes
    - Ces colonnes sont optionnelles (NULL autorisé)
    - Pas d'impact sur les données existantes
*/

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS height INTEGER;
