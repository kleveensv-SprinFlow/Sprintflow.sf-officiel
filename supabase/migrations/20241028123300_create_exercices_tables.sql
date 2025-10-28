CREATE TABLE exercices_reference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom_fr TEXT NOT NULL,
    categorie TEXT NOT NULL,
    groupe_analyse TEXT,
    qualite_cible TEXT NOT NULL,
    unite TEXT NOT NULL,
    ratio_base FLOAT,
    ratio_avance FLOAT NOT NULL,
    ratio_elite FLOAT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_exercices_reference_categorie ON exercices_reference(categorie);
CREATE INDEX idx_exercices_reference_qualite_cible ON exercices_reference(qualite_cible);