/*
  # Create body_compositions view

  1. New View
    - `body_compositions` - View that provides English column names mapping to donnees_corporelles
  
  2. Purpose
    - Provides backward compatibility for code expecting body_compositions table
    - Maps French column names to English equivalents
    - Maintains data integrity by using the existing donnees_corporelles table
  
  3. Column Mappings
    - id -> id
    - user_id -> athlete_id  
    - date -> date
    - weight_kg -> poids_kg
    - body_fat_percentage -> masse_grasse_pct
    - muscle_mass_kg -> masse_musculaire_kg
    - skeletal_muscle_kg -> muscle_squelettique_kg
    - created_at -> created_at
  
  4. Security
    - View inherits RLS policies from donnees_corporelles table
*/

-- Create a view that maps donnees_corporelles to body_compositions with English column names
CREATE OR REPLACE VIEW body_compositions AS
SELECT 
  id,
  athlete_id as user_id,
  date,
  poids_kg as weight_kg,
  masse_grasse_pct as body_fat_percentage,
  masse_musculaire_kg as muscle_mass_kg,
  muscle_squelettique_kg as skeletal_muscle_kg,
  created_at
FROM donnees_corporelles;

-- Grant access to the view
GRANT SELECT ON body_compositions TO authenticated;
GRANT SELECT ON body_compositions TO anon;