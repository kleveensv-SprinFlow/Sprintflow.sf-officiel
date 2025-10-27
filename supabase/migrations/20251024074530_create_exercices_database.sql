/*
  # Création de la base de données d'exercices standardisée

  ## Nouvelles Tables
  
  ### `exercices_reference`
  Table de référence contenant tous les exercices de musculation et haltérophilie en français
  
  **Colonnes** :
  - `id` (uuid, PK) : Identifiant unique
  - `nom` (text, unique) : Nom de l'exercice en français
  - `nom_alternatif` (text[]) : Noms alternatifs ou variantes (ex: "Power Clean", "Hang Clean")
  - `categorie` (text) : Catégorie principale
    - 'halterophilie' : Exercices olympiques
    - 'muscu_bas' : Musculation bas du corps
    - 'muscu_haut' : Musculation haut du corps  
    - 'unilateral' : Exercices unilatéraux
  - `groupe_exercice` (text) : Groupe de regroupement (ex: "groupe_clean", "groupe_sdt")
  - `bareme_intermediaire` (numeric) : Ratio poids/poids de corps pour niveau intermédiaire
  - `bareme_avance` (numeric) : Ratio pour niveau avancé
  - `bareme_elite` (numeric) : Ratio pour niveau élite
  - `description` (text) : Description optionnelle
  - `created_at` (timestamptz) : Date de création
  
  ## Données de référence
  
  Insertion d'une base complète d'exercices pertinents pour l'athlétisme avec leurs barèmes.
  
  ## Sécurité
  
  - Table en lecture seule pour tous les utilisateurs authentifiés
  - Seul l'admin peut modifier (via migrations)
*/

-- Création de la table de référence des exercices
CREATE TABLE IF NOT EXISTS exercices_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT UNIQUE NOT NULL,
  nom_alternatif TEXT[] DEFAULT '{}',
  categorie TEXT NOT NULL CHECK (categorie IN ('halterophilie', 'muscu_bas', 'muscu_haut', 'unilateral')),
  groupe_exercice TEXT NOT NULL,
  bareme_intermediaire NUMERIC(4,2) NOT NULL,
  bareme_avance NUMERIC(4,2) NOT NULL,
  bareme_elite NUMERIC(4,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_exercices_categorie ON exercices_reference(categorie);
CREATE INDEX IF NOT EXISTS idx_exercices_groupe ON exercices_reference(groupe_exercice);
CREATE INDEX IF NOT EXISTS idx_exercices_nom ON exercices_reference(nom);

-- RLS : Lecture pour tous, modification interdite
ALTER TABLE exercices_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture exercices pour tous"
  ON exercices_reference FOR SELECT
  TO authenticated
  USING (true);

-- Insertion des exercices d'haltérophilie
INSERT INTO exercices_reference (nom, nom_alternatif, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
  ('Épaulé', ARRAY['Power Clean', 'Clean', 'Hang Power Clean'], 'halterophilie', 'groupe_clean', 1.00, 1.30, 1.60, 'Mouvement olympique complet ou partiel'),
  ('Épaulé-Jeté', ARRAY['Clean and Jerk', 'C&J'], 'halterophilie', 'groupe_clean_jete', 1.10, 1.40, 1.75, 'Mouvement olympique complet'),
  ('Arraché', ARRAY['Snatch', 'Power Snatch', 'Hang Snatch'], 'halterophilie', 'groupe_arrache', 0.80, 1.05, 1.35, 'Mouvement olympique arraché'),
  ('Jeté', ARRAY['Jerk', 'Push Jerk', 'Split Jerk'], 'halterophilie', 'groupe_jete', 1.00, 1.25, 1.55, 'Phase de jeté seule');

-- Insertion des exercices musculation bas du corps
INSERT INTO exercices_reference (nom, nom_alternatif, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
  ('Squat', ARRAY['Back Squat', 'Squat Arrière'], 'muscu_bas', 'groupe_squat', 1.50, 1.85, 2.25, 'Squat barre sur le dos'),
  ('Front Squat', ARRAY['Squat Avant'], 'muscu_bas', 'groupe_front_squat', 1.25, 1.60, 1.95, 'Squat barre devant'),
  ('Soulevé de Terre', ARRAY['Deadlift', 'SDT'], 'muscu_bas', 'groupe_sdt', 1.75, 2.15, 2.60, 'Soulevé de terre classique'),
  ('Soulevé de Terre Roumain', ARRAY['RDL', 'Romanian Deadlift'], 'muscu_bas', 'groupe_rdl', 1.40, 1.75, 2.10, 'Variante jambes tendues'),
  ('Hip Thrust', ARRAY['Poussée de Hanches'], 'muscu_bas', 'groupe_hip_thrust', 1.80, 2.25, 2.75, 'Extension de hanches'),
  ('Presse à Cuisses', ARRAY['Leg Press'], 'muscu_bas', 'groupe_presse', 2.00, 2.50, 3.00, 'Presse guidée');

-- Insertion des exercices musculation haut du corps
INSERT INTO exercices_reference (nom, nom_alternatif, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
  ('Développé Couché', ARRAY['Bench Press', 'DC'], 'muscu_haut', 'groupe_dc', 1.00, 1.30, 1.65, 'Développé horizontal'),
  ('Développé Incliné', ARRAY['Incline Bench Press'], 'muscu_haut', 'groupe_incline', 0.85, 1.10, 1.40, 'Développé incliné'),
  ('Développé Militaire', ARRAY['Overhead Press', 'Military Press'], 'muscu_haut', 'groupe_militaire', 0.65, 0.85, 1.10, 'Développé vertical'),
  ('Traction', ARRAY['Pull-up', 'Chin-up'], 'muscu_haut', 'groupe_traction', 1.00, 1.25, 1.50, 'Traction lestée ou poids de corps'),
  ('Rowing Barre', ARRAY['Barbell Row', 'Bent Over Row'], 'muscu_haut', 'groupe_rowing', 0.90, 1.15, 1.45, 'Tirage horizontal'),
  ('Dips', ARRAY['Dips Lestés'], 'muscu_haut', 'groupe_dips', 1.00, 1.30, 1.65, 'Dips lestés ou poids de corps');

-- Insertion des exercices unilatéraux
INSERT INTO exercices_reference (nom, nom_alternatif, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
  ('Fente', ARRAY['Lunge', 'Split Squat'], 'unilateral', 'groupe_fente', 0.80, 1.05, 1.35, 'Fente avant ou arrière'),
  ('Fente Bulgare', ARRAY['Bulgarian Split Squat'], 'unilateral', 'groupe_bulgare', 0.85, 1.15, 1.45, 'Fente arrière pied surélevé'),
  ('Pistol Squat', ARRAY['Squat Unijambiste'], 'unilateral', 'groupe_pistol', 0.60, 0.85, 1.10, 'Squat sur une jambe'),
  ('Soulevé de Terre Unilateral', ARRAY['Single Leg Deadlift', 'SDT Unilateral'], 'unilateral', 'groupe_sdt_uni', 0.70, 0.95, 1.25, 'SDT sur une jambe'),
  ('Step-up', ARRAY['Montée sur Boîte'], 'unilateral', 'groupe_stepup', 0.75, 1.00, 1.30, 'Montée sur plateforme');

-- Commentaires
COMMENT ON TABLE exercices_reference IS 'Base de données de référence des exercices de musculation et haltérophilie pour l''athlétisme';
COMMENT ON COLUMN exercices_reference.nom IS 'Nom principal de l''exercice en français';
COMMENT ON COLUMN exercices_reference.nom_alternatif IS 'Noms alternatifs et variantes acceptées';
COMMENT ON COLUMN exercices_reference.categorie IS 'Catégorie: halterophilie, muscu_bas, muscu_haut, unilateral';
COMMENT ON COLUMN exercices_reference.groupe_exercice IS 'Groupe de regroupement pour calcul des scores (ex: groupe_clean)';
COMMENT ON COLUMN exercices_reference.bareme_intermediaire IS 'Ratio charge/poids de corps pour niveau intermédiaire';
COMMENT ON COLUMN exercices_reference.bareme_avance IS 'Ratio charge/poids de corps pour niveau avancé';
COMMENT ON COLUMN exercices_reference.bareme_elite IS 'Ratio charge/poids de corps pour niveau élite';
