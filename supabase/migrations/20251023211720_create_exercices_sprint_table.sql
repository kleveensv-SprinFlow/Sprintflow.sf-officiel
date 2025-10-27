/*
  # Création de la table des exercices standardisés pour le sprint

  1. Nouvelle Table
    - `exercices_sprint`
      - `id` (uuid, primary key)
      - `nom_fr` (text) - Nom en français
      - `nom_en` (text) - Nom en anglais
      - `categorie` (text) - Type d'exercice (force_max, puissance, vitesse, etc.)
      - `utilisable_pour_indice` (boolean) - Si utilisé dans le calcul de l'indice de performance
      - `ratio_excellent` (numeric) - Ratio Force/Poids considéré comme excellent
      - `ratio_tres_bon` (numeric) - Ratio Force/Poids considéré comme très bon
      - `ratio_bon` (numeric) - Ratio Force/Poids considéré comme bon
      - `ordre_affichage` (integer) - Ordre dans la liste déroulante
      - `created_at` (timestamptz)

  2. Sécurité
    - Enable RLS
    - Lecture publique (pour dropdown)
    - Pas de modification par les utilisateurs (données fixes)

  3. Données initiales
    - Exercices de force max (Squat, SDT, etc.)
    - Exercices de puissance (Power Clean, Épaulé, Arraché, etc.)
    - Exercices de vitesse (100m, 60m, etc.)
*/

CREATE TABLE IF NOT EXISTS exercices_sprint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_fr text NOT NULL,
  nom_en text,
  categorie text NOT NULL,
  utilisable_pour_indice boolean DEFAULT false,
  ratio_excellent numeric,
  ratio_tres_bon numeric,
  ratio_bon numeric,
  ordre_affichage integer DEFAULT 999,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exercices_sprint ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exercices lisibles par tous"
  ON exercices_sprint
  FOR SELECT
  TO public
  USING (true);

-- Insertion des exercices standardisés pour le sprint
INSERT INTO exercices_sprint (nom_fr, nom_en, categorie, utilisable_pour_indice, ratio_excellent, ratio_tres_bon, ratio_bon, ordre_affichage) VALUES
-- Force Max - Membres inférieurs
('Squat Complet', 'Back Squat', 'force_max', true, 2.5, 2.0, 1.7, 1),
('Front Squat', 'Front Squat', 'force_max', true, 2.0, 1.7, 1.4, 2),
('Soulevé de Terre', 'Deadlift', 'force_max', true, 2.8, 2.3, 2.0, 3),
('Soulevé de Terre Roumain', 'Romanian Deadlift', 'force_max', true, 2.0, 1.7, 1.4, 4),
('Hip Thrust', 'Hip Thrust', 'force_max', true, 2.5, 2.0, 1.7, 5),
('Fentes Bulgares (par jambe)', 'Bulgarian Split Squat', 'force_max', true, 1.2, 1.0, 0.8, 6),

-- Puissance - Haltérophilie
('Power Clean', 'Power Clean', 'puissance', true, 1.4, 1.2, 1.0, 10),
('Épaulé', 'Clean', 'puissance', true, 1.5, 1.3, 1.1, 11),
('Arraché', 'Snatch', 'puissance', true, 1.2, 1.0, 0.85, 12),
('Power Snatch', 'Power Snatch', 'puissance', true, 1.0, 0.85, 0.7, 13),
('Épaulé-Jeté', 'Clean and Jerk', 'puissance', true, 1.6, 1.4, 1.2, 14),

-- Puissance - Sauts
('Squat Jump (hauteur en cm)', 'Squat Jump', 'puissance', false, null, null, null, 20),
('Countermovement Jump (hauteur en cm)', 'Countermovement Jump', 'puissance', false, null, null, null, 21),
('Drop Jump (hauteur en cm)', 'Drop Jump', 'puissance', false, null, null, null, 22),

-- Vitesse (temps en secondes, pas de ratio)
('100m Sprint', '100m Sprint', 'vitesse', false, null, null, null, 30),
('60m Sprint', '60m Sprint', 'vitesse', false, null, null, null, 31),
('40m Sprint', '40m Sprint', 'vitesse', false, null, null, null, 32),
('30m Sprint', '30m Sprint', 'vitesse', false, null, null, null, 33),
('20m Sprint', '20m Sprint', 'vitesse', false, null, null, null, 34),
('10m Sprint', '10m Sprint', 'vitesse', false, null, null, null, 35),

-- Autres
('Développé Couché', 'Bench Press', 'force_max', false, 1.5, 1.2, 1.0, 40),
('Développé Incliné', 'Incline Bench Press', 'force_max', false, 1.3, 1.1, 0.9, 41),
('Traction Lestée', 'Weighted Pull-up', 'force_max', false, 1.3, 1.0, 0.8, 42)
ON CONFLICT DO NOTHING;