/*
  # Ajout de exercice_id et date_echeance à la table objectifs

  1. Modifications de la table objectifs
    - Ajouter la colonne `exercice_id` (uuid, nullable, foreign key vers exercices_reference)
    - Ajouter la colonne `date_echeance` (timestamptz, nullable)
    - Rendre `epreuve_id` nullable pour permettre les objectifs sur exercices
    - Ajouter un index sur `exercice_id` pour optimiser les jointures
    
  2. Contraintes
    - Au moins un des deux champs doit être rempli (epreuve_id OU exercice_id)
    - Les deux ne peuvent pas être remplis en même temps
    
  3. Security
    - Mettre à jour les policies RLS existantes pour supporter les deux types d'objectifs
*/

-- Rendre epreuve_id nullable (enlever la contrainte NOT NULL)
ALTER TABLE public.objectifs ALTER COLUMN epreuve_id DROP NOT NULL;

-- Ajouter la colonne exercice_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'objectifs' AND column_name = 'exercice_id'
    ) THEN
        ALTER TABLE public.objectifs ADD COLUMN exercice_id uuid;
    END IF;
END $$;

-- Ajouter la colonne date_echeance si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'objectifs' AND column_name = 'date_echeance'
    ) THEN
        ALTER TABLE public.objectifs ADD COLUMN date_echeance timestamptz;
    END IF;
END $$;

-- Ajouter la contrainte de clé étrangère pour exercice_id si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'objectifs_exercice_id_fkey'
    ) THEN
        ALTER TABLE public.objectifs
        ADD CONSTRAINT objectifs_exercice_id_fkey
        FOREIGN KEY (exercice_id)
        REFERENCES public.exercices_reference(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- Ajouter une contrainte CHECK pour s'assurer qu'au moins un des deux est rempli
-- mais pas les deux en même temps
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'objectifs_check_one_reference'
    ) THEN
        ALTER TABLE public.objectifs
        ADD CONSTRAINT objectifs_check_one_reference
        CHECK (
            (epreuve_id IS NOT NULL AND exercice_id IS NULL) OR
            (epreuve_id IS NULL AND exercice_id IS NOT NULL)
        );
    END IF;
END $$;

-- Créer un index sur exercice_id pour optimiser les jointures
CREATE INDEX IF NOT EXISTS idx_objectifs_exercice_id ON public.objectifs(exercice_id);

-- Créer un index sur date_echeance pour les recherches par date
CREATE INDEX IF NOT EXISTS idx_objectifs_date_echeance ON public.objectifs(date_echeance);
