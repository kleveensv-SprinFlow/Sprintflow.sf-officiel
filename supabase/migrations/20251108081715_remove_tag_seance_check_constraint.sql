/*
  # Suppression de la contrainte obsolète sur tag_seance
  
  La contrainte `workouts_tag_seance_check` limite tag_seance à seulement 3 valeurs fixes
  anciennes ('vitesse_max', 'endurance_lactique', 'technique_recup'), ce qui empêche
  l'utilisation des nouveaux types de séances personnalisés.
  
  Cette migration supprime cette contrainte pour permettre l'utilisation de tous les types
  de séances (référence + personnalisés).
*/

ALTER TABLE workouts 
DROP CONSTRAINT IF EXISTS workouts_tag_seance_check;
