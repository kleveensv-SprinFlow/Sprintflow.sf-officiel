/*
  # Module 1: Évolution du Profil Athlète avec Objectifs de Saison

  1. Modifications de la table profiles
    - Ajout de `date_de_naissance` (date de naissance)
    - Ajout de `taille_cm` (taille en centimètres)
    - Ajout de `sexe` ('homme' ou 'femme')
    - Ajout de `objectif_saison` (type d'objectif: préparation, maintien, affûtage)
    - Ajout de `poids_cible_kg` (poids cible pour l'objectif)
    - Ajout de `date_cible` (date cible pour atteindre l'objectif)

  2. Modifications de la table objectifs_presets
    - Ajout de `verrouille_par_coach` (booléen: true si coach verrouille les objectifs)
    - Ajout de `derniere_modification_auto` (timestamp de dernière modification automatique)

  3. Sécurité
    - Les politiques RLS existantes sont maintenues
*/

-- Ajouter les colonnes au profil athlète
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'date_de_naissance'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_de_naissance date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'taille_cm'
  ) THEN
    ALTER TABLE profiles ADD COLUMN taille_cm integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'sexe'
  ) THEN
    ALTER TABLE profiles ADD COLUMN sexe text CHECK (sexe IN ('homme', 'femme'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'objectif_saison'
  ) THEN
    ALTER TABLE profiles ADD COLUMN objectif_saison text CHECK (objectif_saison IN ('preparation', 'maintien', 'affutage'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'poids_cible_kg'
  ) THEN
    ALTER TABLE profiles ADD COLUMN poids_cible_kg numeric(5,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'date_cible'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_cible date;
  END IF;
END $$;

-- Ajouter les colonnes à objectifs_presets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'objectifs_presets' AND column_name = 'verrouille_par_coach'
  ) THEN
    ALTER TABLE objectifs_presets ADD COLUMN verrouille_par_coach boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'objectifs_presets' AND column_name = 'derniere_modification_auto'
  ) THEN
    ALTER TABLE objectifs_presets ADD COLUMN derniere_modification_auto timestamptz;
  END IF;
END $$;