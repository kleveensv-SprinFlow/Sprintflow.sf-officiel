/*
  # Module Entraînements Enrichi - Tracking Détaillé

  1. Modifications de la table workouts
    - Mise à jour des structures JSON pour plus de détails
    - Support des séries/répétitions avec chrono individuel
    - Support des sauts et lancers avec séries/répétitions
    - Support des types de mesure (décamètre/théodolite)
    - Support des courses en côte avec lieu

  2. Structures JSON enrichies
    - courses_json: distance, temps, type_chrono, chaussures, series, reps, en_cote, lieu_cote
    - muscu_json: exercice_id, exercice_nom, series, reps, poids, chronos par rep
    - sauts_json: discipline, series, reps, distances/chronos par rep, mesure, chaussures
    - lancers_json: discipline, series, reps, distances par rep, mesure

  3. Types de séance élargis
    - lactique_piste: Lactique sur piste
    - lactique_cote: Lactique en côte
    - aerobie: Aérobie
    - musculation: Musculation/Haltérophilie
*/

-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$
BEGIN
  -- Sauts en JSON
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'sauts_json'
  ) THEN
    ALTER TABLE workouts ADD COLUMN sauts_json jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Lancers en JSON
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workouts' AND column_name = 'lancers_json'
  ) THEN
    ALTER TABLE workouts ADD COLUMN lancers_json jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Mettre à jour la contrainte du tag_seance pour inclure les nouveaux types
DO $$
BEGIN
  -- Supprimer l'ancienne contrainte
  ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_tag_seance_check;

  -- Ajouter la nouvelle contrainte avec plus de types
  ALTER TABLE workouts ADD CONSTRAINT workouts_tag_seance_check
    CHECK (tag_seance IN (
      'vitesse_max',
      'endurance_lactique',
      'technique_recup',
      'lactique_piste',
      'lactique_cote',
      'aerobie',
      'musculation'
    ));
END $$;

-- Créer des index GIN pour les nouvelles colonnes JSONB
CREATE INDEX IF NOT EXISTS idx_workouts_sauts_json ON workouts USING GIN (sauts_json);
CREATE INDEX IF NOT EXISTS idx_workouts_lancers_json ON workouts USING GIN (lancers_json);

-- Documentation des nouvelles structures JSON

COMMENT ON COLUMN workouts.courses_json IS
'Array of runs with detailed tracking:
[
  {
    "distance": "100m",
    "temps": 10.72,
    "type_chrono": "manuel" | "electronique",
    "chaussures": "pointes" | "baskets",
    "repos": "8 min",
    "series": 3,
    "reps": 5,
    "chronos": [10.72, 10.80, 10.75, 10.78, 10.82],
    "en_cote": true,
    "lieu_cote": "Colline du parc"
  }
]';

COMMENT ON COLUMN workouts.muscu_json IS
'Array of strength exercises with series/reps tracking:
[
  {
    "exercice_id": "uuid-from-exercices-table",
    "exercice_nom": "Squat",
    "series": 5,
    "reps": 5,
    "poids": 120,
    "chronos": [2.5, 2.3, 2.4, 2.6, 2.5]
  }
]';

COMMENT ON COLUMN workouts.sauts_json IS
'Array of jumps with series/reps tracking:
[
  {
    "discipline": "Longueur",
    "series": 3,
    "reps": 6,
    "distances": [7.20, 7.15, 7.25, 7.18, 7.22, 7.30],
    "mesure": "decametre" | "theodolite",
    "chaussures": "pointes" | "baskets"
  }
]';

COMMENT ON COLUMN workouts.lancers_json IS
'Array of throws with series/reps tracking:
[
  {
    "discipline": "Poids",
    "series": 3,
    "reps": 6,
    "distances": [15.20, 15.45, 15.30, 15.55, 15.40, 15.60],
    "mesure": "decametre" | "theodolite"
  }
]';

COMMENT ON COLUMN workouts.tag_seance IS
'Type/intention of the workout:
- vitesse_max: Max speed / Explosivity
- endurance_lactique: Lactic endurance (deprecated, use lactique_piste or lactique_cote)
- technique_recup: Technique / Recovery
- lactique_piste: Lactic work on track
- lactique_cote: Lactic work on hills
- aerobie: Aerobic work
- musculation: Strength training / Weightlifting';
