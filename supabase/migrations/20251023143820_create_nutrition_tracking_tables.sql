/*
  # Module de Suivi Athlétique - Tables Nutrition et Corporel

  ## Nouvelles Tables
  
  ### 1. objectifs_presets
  Stocke les objectifs nutritionnels prédéfinis pour chaque type de journée
  - id (uuid, primary key)
  - athlete_id (uuid, référence auth.users)
  - type_jour (text: "haut", "bas", "repos")
  - kcal_objectif (integer)
  - proteines_objectif_g (integer)
  - glucides_objectif_g (integer)
  - lipides_objectif_g (integer)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 2. donnees_corporelles
  Stocke les données de pesée et composition corporelle
  - id (uuid, primary key)
  - athlete_id (uuid, référence auth.users)
  - date (date)
  - poids_kg (decimal, obligatoire)
  - masse_grasse_pct (decimal, optionnel)
  - masse_musculaire_kg (decimal, optionnel)
  - muscle_squelettique_kg (decimal, optionnel)
  - created_at (timestamptz)

  ### 3. aliments_favoris
  Raccourcis vers les aliments les plus utilisés
  - id (uuid, primary key)
  - athlete_id (uuid, référence auth.users)
  - nom (text)
  - kcal_100g (decimal)
  - proteines_100g (decimal)
  - glucides_100g (decimal)
  - lipides_100g (decimal)
  - fibres_100g (decimal, optionnel)
  - sodium_100mg (decimal, optionnel)
  - potassium_100mg (decimal, optionnel)
  - source_type (text: "off", "personnel", "recette")
  - source_id (text, optionnel)
  - created_at (timestamptz)

  ### 4. aliments_personnels
  Aliments créés manuellement par l'athlète
  - id (uuid, primary key)
  - athlete_id (uuid, référence auth.users)
  - nom (text)
  - kcal_100g (decimal)
  - proteines_100g (decimal)
  - glucides_100g (decimal)
  - lipides_100g (decimal)
  - fibres_100g (decimal, optionnel)
  - sodium_100mg (decimal, optionnel)
  - potassium_100mg (decimal, optionnel)
  - created_at (timestamptz)

  ### 5. recettes_personnelles
  Recettes créées par l'athlète
  - id (uuid, primary key)
  - athlete_id (uuid, référence auth.users)
  - nom (text)
  - ingredients (jsonb, format: [{aliment_id, quantite_g, nom, macros}])
  - poids_total_recette_g (decimal)
  - nombre_portions_default (integer)
  - kcal_total (decimal)
  - proteines_total_g (decimal)
  - glucides_total_g (decimal)
  - lipides_total_g (decimal)
  - fibres_total_g (decimal)
  - sodium_total_mg (decimal)
  - potassium_total_mg (decimal)
  - created_at (timestamptz)
  - updated_at (timestamptz)

  ### 6. journal_alimentaire
  Enregistre tous les aliments consommés
  - id (uuid, primary key)
  - athlete_id (uuid, référence auth.users)
  - date (date)
  - tag_moment (text: "pre_entrainement", "post_entrainement", "repas_1", "repas_2", "pre_sommeil")
  - aliment_nom (text)
  - quantite_g (decimal)
  - kcal (decimal)
  - proteines_g (decimal)
  - glucides_g (decimal)
  - lipides_g (decimal)
  - fibres_g (decimal)
  - sodium_mg (decimal)
  - potassium_mg (decimal)
  - hydratation_ml (integer, default 0)
  - created_at (timestamptz)

  ## Sécurité
  - RLS activé sur toutes les tables
  - Les athlètes peuvent lire/écrire uniquement leurs propres données
  - Les coachs peuvent lire les données des athlètes dans leurs groupes
  - Les coachs peuvent modifier les objectifs_presets de leurs athlètes
*/

-- Table objectifs_presets
CREATE TABLE IF NOT EXISTS objectifs_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type_jour text NOT NULL CHECK (type_jour IN ('haut', 'bas', 'repos')),
  kcal_objectif integer NOT NULL DEFAULT 0,
  proteines_objectif_g integer NOT NULL DEFAULT 0,
  glucides_objectif_g integer NOT NULL DEFAULT 0,
  lipides_objectif_g integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(athlete_id, type_jour)
);

ALTER TABLE objectifs_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own objectifs"
  ON objectifs_presets FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athletes can insert own objectifs"
  ON objectifs_presets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can update own objectifs"
  ON objectifs_presets FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can delete own objectifs"
  ON objectifs_presets FOR DELETE
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can view athletes objectifs"
  ON objectifs_presets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.athlete_id = objectifs_presets.athlete_id
      AND g.coach_id = auth.uid()
    )
  );

CREATE POLICY "Coaches can update athletes objectifs"
  ON objectifs_presets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.athlete_id = objectifs_presets.athlete_id
      AND g.coach_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.athlete_id = objectifs_presets.athlete_id
      AND g.coach_id = auth.uid()
    )
  );

-- Table donnees_corporelles
CREATE TABLE IF NOT EXISTS donnees_corporelles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  poids_kg decimal(5,2) NOT NULL,
  masse_grasse_pct decimal(4,2),
  masse_musculaire_kg decimal(5,2),
  muscle_squelettique_kg decimal(5,2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(athlete_id, date)
);

ALTER TABLE donnees_corporelles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own body data"
  ON donnees_corporelles FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athletes can insert own body data"
  ON donnees_corporelles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can update own body data"
  ON donnees_corporelles FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can delete own body data"
  ON donnees_corporelles FOR DELETE
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can view athletes body data"
  ON donnees_corporelles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.athlete_id = donnees_corporelles.athlete_id
      AND g.coach_id = auth.uid()
    )
  );

-- Table aliments_favoris
CREATE TABLE IF NOT EXISTS aliments_favoris (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom text NOT NULL,
  kcal_100g decimal(8,2) NOT NULL DEFAULT 0,
  proteines_100g decimal(6,2) NOT NULL DEFAULT 0,
  glucides_100g decimal(6,2) NOT NULL DEFAULT 0,
  lipides_100g decimal(6,2) NOT NULL DEFAULT 0,
  fibres_100g decimal(6,2) DEFAULT 0,
  sodium_100mg decimal(6,2) DEFAULT 0,
  potassium_100mg decimal(6,2) DEFAULT 0,
  source_type text CHECK (source_type IN ('off', 'personnel', 'recette')),
  source_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE aliments_favoris ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own favorites"
  ON aliments_favoris FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athletes can insert own favorites"
  ON aliments_favoris FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can update own favorites"
  ON aliments_favoris FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can delete own favorites"
  ON aliments_favoris FOR DELETE
  TO authenticated
  USING (auth.uid() = athlete_id);

-- Table aliments_personnels
CREATE TABLE IF NOT EXISTS aliments_personnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom text NOT NULL,
  kcal_100g decimal(8,2) NOT NULL DEFAULT 0,
  proteines_100g decimal(6,2) NOT NULL DEFAULT 0,
  glucides_100g decimal(6,2) NOT NULL DEFAULT 0,
  lipides_100g decimal(6,2) NOT NULL DEFAULT 0,
  fibres_100g decimal(6,2) DEFAULT 0,
  sodium_100mg decimal(6,2) DEFAULT 0,
  potassium_100mg decimal(6,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE aliments_personnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own personal foods"
  ON aliments_personnels FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athletes can insert own personal foods"
  ON aliments_personnels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can update own personal foods"
  ON aliments_personnels FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can delete own personal foods"
  ON aliments_personnels FOR DELETE
  TO authenticated
  USING (auth.uid() = athlete_id);

-- Table recettes_personnelles
CREATE TABLE IF NOT EXISTS recettes_personnelles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom text NOT NULL,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  poids_total_recette_g decimal(8,2) NOT NULL,
  nombre_portions_default integer NOT NULL DEFAULT 1,
  kcal_total decimal(8,2) NOT NULL DEFAULT 0,
  proteines_total_g decimal(6,2) NOT NULL DEFAULT 0,
  glucides_total_g decimal(6,2) NOT NULL DEFAULT 0,
  lipides_total_g decimal(6,2) NOT NULL DEFAULT 0,
  fibres_total_g decimal(6,2) DEFAULT 0,
  sodium_total_mg decimal(6,2) DEFAULT 0,
  potassium_total_mg decimal(6,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recettes_personnelles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own recipes"
  ON recettes_personnelles FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athletes can insert own recipes"
  ON recettes_personnelles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can update own recipes"
  ON recettes_personnelles FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can delete own recipes"
  ON recettes_personnelles FOR DELETE
  TO authenticated
  USING (auth.uid() = athlete_id);

-- Table journal_alimentaire
CREATE TABLE IF NOT EXISTS journal_alimentaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  tag_moment text CHECK (tag_moment IN ('pre_entrainement', 'post_entrainement', 'repas_1', 'repas_2', 'pre_sommeil')),
  aliment_nom text NOT NULL,
  quantite_g decimal(8,2) NOT NULL,
  kcal decimal(8,2) NOT NULL DEFAULT 0,
  proteines_g decimal(6,2) NOT NULL DEFAULT 0,
  glucides_g decimal(6,2) NOT NULL DEFAULT 0,
  lipides_g decimal(6,2) NOT NULL DEFAULT 0,
  fibres_g decimal(6,2) DEFAULT 0,
  sodium_mg decimal(6,2) DEFAULT 0,
  potassium_mg decimal(6,2) DEFAULT 0,
  hydratation_ml integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journal_alimentaire ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can view own food journal"
  ON journal_alimentaire FOR SELECT
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Athletes can insert own food journal"
  ON journal_alimentaire FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can update own food journal"
  ON journal_alimentaire FOR UPDATE
  TO authenticated
  USING (auth.uid() = athlete_id)
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can delete own food journal"
  ON journal_alimentaire FOR DELETE
  TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can view athletes food journal"
  ON journal_alimentaire FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups g
      INNER JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.athlete_id = journal_alimentaire.athlete_id
      AND g.coach_id = auth.uid()
    )
  );

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_objectifs_presets_athlete ON objectifs_presets(athlete_id);
CREATE INDEX IF NOT EXISTS idx_donnees_corporelles_athlete_date ON donnees_corporelles(athlete_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_aliments_favoris_athlete ON aliments_favoris(athlete_id);
CREATE INDEX IF NOT EXISTS idx_aliments_personnels_athlete ON aliments_personnels(athlete_id);
CREATE INDEX IF NOT EXISTS idx_recettes_personnelles_athlete ON recettes_personnelles(athlete_id);
CREATE INDEX IF NOT EXISTS idx_journal_alimentaire_athlete_date ON journal_alimentaire(athlete_id, date DESC);