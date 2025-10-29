/*
  # Add missing categories to exercices_reference

  Add 'pliometrie' and 'lancers' to the allowed categories
*/

-- Drop old constraint
ALTER TABLE exercices_reference
DROP CONSTRAINT IF EXISTS exercices_reference_categorie_check;

-- Add new constraint with all categories
ALTER TABLE exercices_reference
ADD CONSTRAINT exercices_reference_categorie_check 
CHECK (categorie = ANY (ARRAY['halterophilie'::text, 'muscu_bas'::text, 'muscu_haut'::text, 'unilateral'::text, 'pliometrie'::text, 'lancers'::text]));