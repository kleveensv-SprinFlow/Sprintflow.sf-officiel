/*
  # Ajout du suivi détaillé des performances par répétition

  1. Modifications
    - Les données de performances individuelles sont stockées dans les colonnes JSONB existantes
    - Aucune modification de structure de table n'est nécessaire
    - Les colonnes runs, exercises, stairs, jumps et throws supportent déjà les données JSON
  
  2. Structure des données
    - Pour runs, exercises, stairs : `set_data` array contenant les performances de chaque série
      - Chaque série contient un tableau de performances (une par répétition)
      - Exemple: {set_number: 1, performances: [{time: 12.5}, {time: 12.7}]}
    
    - Pour jumps et throws : `attempts` array contenant chaque essai
      - Exemple: [{distance: 6.50, wind_speed: 0.5}, {distance: 6.45}]
  
  3. Notes
    - Cette migration est informative et ne modifie pas la structure
    - Les colonnes JSONB existantes permettent déjà ce type de stockage flexible
    - Rétrocompatibilité totale avec les données existantes
*/

-- Cette migration est informative uniquement
-- Les colonnes JSONB existantes (runs, exercises, stairs, jumps, throws) 
-- supportent déjà les nouvelles structures de données sans modification
SELECT 'Migration informative: Structure de données étendue pour le suivi détaillé des performances' AS message;
