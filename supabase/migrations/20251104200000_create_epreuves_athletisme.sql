/*
  # Création de la table des épreuves d'athlétisme

  1. Nouvelle table
    - `epreuves_athletisme`
      - `id` (uuid, primary key)
      - `nom` (text) - Nom de l'épreuve (ex: "100m", "Lancer de javelot")
      - `categorie` (text) - Catégorie (course, saut, lancer)
      - `type_mesure` (text) - "temps" ou "distance"
      - `unite` (text) - "secondes" ou "metres"
      - `created_at` (timestamp)

  2. Modification de la table objectifs
    - Remplacer `exercice_id` par `epreuve_id`

  3. Données initiales
    - Insertion des épreuves d'athlétisme principales
*/

-- Créer la table epreuves_athletisme
CREATE TABLE IF NOT EXISTS public.epreuves_athletisme (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    nom text NOT NULL,
    categorie text NOT NULL,
    type_mesure text NOT NULL CHECK (type_mesure IN ('temps', 'distance', 'hauteur')),
    unite text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT epreuves_athletisme_pkey PRIMARY KEY (id)
);

-- Enable RLS sur epreuves_athletisme
ALTER TABLE public.epreuves_athletisme ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les épreuves
CREATE POLICY "Tout le monde peut lire les épreuves"
    ON public.epreuves_athletisme FOR SELECT
    USING (true);

-- Supprimer les anciennes contraintes de objectifs si elles existent
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'objectifs_exercice_id_fkey'
        AND table_name = 'objectifs'
    ) THEN
        ALTER TABLE public.objectifs DROP CONSTRAINT objectifs_exercice_id_fkey;
    END IF;
END $$;

-- Supprimer l'ancienne colonne exercice_id si elle existe et ajouter epreuve_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'objectifs' AND column_name = 'exercice_id'
    ) THEN
        ALTER TABLE public.objectifs DROP COLUMN exercice_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'objectifs' AND column_name = 'epreuve_id'
    ) THEN
        ALTER TABLE public.objectifs ADD COLUMN epreuve_id uuid;
    END IF;
END $$;

-- Ajouter la contrainte de clé étrangère
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'objectifs_epreuve_id_fkey'
    ) THEN
        ALTER TABLE public.objectifs
        ADD CONSTRAINT objectifs_epreuve_id_fkey
        FOREIGN KEY (epreuve_id)
        REFERENCES public.epreuves_athletisme(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Rendre epreuve_id NOT NULL après ajout de la contrainte
ALTER TABLE public.objectifs ALTER COLUMN epreuve_id SET NOT NULL;

-- Insérer les épreuves d'athlétisme principales
INSERT INTO public.epreuves_athletisme (nom, categorie, type_mesure, unite) VALUES
    -- Courses de sprint
    ('100m', 'course_sprint', 'temps', 'secondes'),
    ('200m', 'course_sprint', 'temps', 'secondes'),
    ('400m', 'course_sprint', 'temps', 'secondes'),

    -- Courses de demi-fond
    ('800m', 'course_demi_fond', 'temps', 'secondes'),
    ('1500m', 'course_demi_fond', 'temps', 'secondes'),

    -- Courses de fond
    ('3000m', 'course_fond', 'temps', 'secondes'),
    ('5000m', 'course_fond', 'temps', 'secondes'),
    ('10000m', 'course_fond', 'temps', 'secondes'),

    -- Courses de haies
    ('100m haies', 'course_haies', 'temps', 'secondes'),
    ('110m haies', 'course_haies', 'temps', 'secondes'),
    ('400m haies', 'course_haies', 'temps', 'secondes'),

    -- Sauts
    ('Saut en hauteur', 'saut', 'hauteur', 'metres'),
    ('Saut en longueur', 'saut', 'distance', 'metres'),
    ('Triple saut', 'saut', 'distance', 'metres'),
    ('Saut à la perche', 'saut', 'hauteur', 'metres'),

    -- Lancers
    ('Lancer de poids', 'lancer', 'distance', 'metres'),
    ('Lancer de disque', 'lancer', 'distance', 'metres'),
    ('Lancer de javelot', 'lancer', 'distance', 'metres'),
    ('Lancer de marteau', 'lancer', 'distance', 'metres')
ON CONFLICT DO NOTHING;
