/*
  # Update bareme columns precision
  
  Changes the numeric precision from NUMERIC(4,2) to NUMERIC(8,2)
  to support larger values like jump distances in cm (e.g., 270 cm)
*/

ALTER TABLE exercices_reference
  ALTER COLUMN bareme_intermediaire TYPE NUMERIC(8,2),
  ALTER COLUMN bareme_avance TYPE NUMERIC(8,2),
  ALTER COLUMN bareme_elite TYPE NUMERIC(8,2);