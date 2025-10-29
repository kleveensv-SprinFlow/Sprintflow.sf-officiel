/*
  # Seed complete exercices list

  1. Clear existing data
  2. Insert all exercises from the provided list with proper categories and ratios
  
  Categories:
  - halterophilie: Haltérophilie
  - muscu_bas: Musculation Bas du Corps
  - muscu_haut: Musculation Haut du Corps
  - unilateral: Unilatéral
  - pliometrie: Pliométrie
  - lancers: Lancers
  
  Barèmes: intermediaire (50 pts), avance (75 pts), elite (100 pts)
*/

-- Clear existing exercises
TRUNCATE TABLE exercices_reference CASCADE;

-- Insert Haltérophilie exercises
INSERT INTO exercices_reference (nom, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
('Épaulé (Clean)', 'halterophilie', 'Groupe Clean', 1.0, 1.35, 1.6, 'Explosivité (Force-Vitesse)'),
('Power Clean', 'halterophilie', 'Groupe Clean', 1.0, 1.3, 1.5, 'Explosivité (Vitesse-Force)'),
('Arraché (Snatch)', 'halterophilie', 'Groupe Snatch', 0.8, 1.0, 1.25, 'Explosivité (Vitesse-Force)'),
('Épaulé-jeté (Clean & Jerk)', 'halterophilie', 'Groupe Clean & Jerk', 1.2, 1.5, 1.75, 'Explosivité (Force-Vitesse)');

-- Insert Muscu. Bas exercises
INSERT INTO exercices_reference (nom, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
('Squat Arrière (Back Squat)', 'muscu_bas', 'Groupe Squat', 1.4, 1.8, 2.2, 'Force Maximale'),
('Squat Avant (Front Squat)', 'muscu_bas', 'Groupe Squat', 1.2, 1.5, 1.8, 'Force Maximale'),
('Soulevé de Terre (Deadlift)', 'muscu_bas', 'Groupe SDT', 1.7, 2.2, 2.6, 'Force Maximale'),
('Soulevé de Terre Roumain (RDL)', 'muscu_bas', 'Groupe SDT Accessoire', 1.3, 1.6, 1.9, 'Force (Chaîne Postérieure)'),
('Hip Thrust', 'muscu_bas', 'Groupe Hip Thrust', 1.8, 2.3, 3.0, 'Force (Chaîne Postérieure)'),
('Presse à Cuisses (Leg Press)', 'muscu_bas', 'Groupe Presse', 2.8, 3.5, 4.5, 'Force (Hypertrophie)'),
('Good Mornings', 'muscu_bas', 'Groupe Acc. Post.', 0.6, 0.8, 1.0, 'Force (Stabilité)');

-- Insert Muscu. Haut exercises
INSERT INTO exercices_reference (nom, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
('Développé Couché', 'muscu_haut', 'Groupe Couché', 1.0, 1.3, 1.5, 'Force Maximale'),
('Développé Militaire', 'muscu_haut', 'Groupe Press', 0.6, 0.8, 1.0, 'Force (Haut du Corps)'),
('Tractions Lestées', 'muscu_haut', 'Groupe Traction', 0.2, 0.4, 0.7, 'Force (Haut du Corps)'),
('Dips Lestés', 'muscu_haut', 'Groupe Dips', 0.3, 0.5, 0.8, 'Force (Haut du Corps)');

-- Insert Unilatéral exercises
INSERT INTO exercices_reference (nom, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
('Squat Bulgare (Split Squat)', 'unilateral', 'Groupe Unilatéral Bas', 0.6, 0.8, 1.0, 'Force (Unilatéral)'),
('Fentes (Marchées ou Statiques)', 'unilateral', 'Groupe Unilatéral Bas', 0.5, 0.7, 0.9, 'Force (Unilatéral)');

-- Insert Pliométrie exercises (note: units in cm)
INSERT INTO exercices_reference (nom, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
('Saut Vertical (Détente Sèche)', 'pliometrie', 'Groupe Saut Vertical', 50, 65, 80, 'Pliométrie'),
('Saut en Longueur (Sans Élan)', 'pliometrie', 'Groupe Saut Horizontal', 240, 270, 300, 'Pliométrie');

-- Insert Lancers exercises (note: units in meters)
INSERT INTO exercices_reference (nom, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
('Lancer Médecine Ball (Arr. 2kg)', 'lancers', 'Groupe Lancer Léger', 6, 8, 12, 'Explosivité (Transfert)'),
('Lancer Poids (Arr. 7.26kg)', 'lancers', 'Groupe Lancer Lourd', 8, 10, 13, 'Force Explosive');