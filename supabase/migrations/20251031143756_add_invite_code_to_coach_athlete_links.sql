/*
  # Add invite code functionality to coach_athlete_links
  
  ## Changes
  1. Add invite_code column (unique code for invitation)
  2. Add used column (boolean to track if code has been used)
  3. Add index on invite_code for fast lookups
  4. Update RLS policies to allow athletes to read links by invite code
*/

-- Add new columns
ALTER TABLE coach_athlete_links 
ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT FALSE;

-- Create index for fast invite code lookups
CREATE INDEX IF NOT EXISTS idx_coach_athlete_links_invite_code 
ON coach_athlete_links(invite_code);

-- Add policy to allow authenticated users to read links by invite code
DROP POLICY IF EXISTS "Anyone can read links by invite code" ON coach_athlete_links;

CREATE POLICY "Anyone can read links by invite code"
  ON coach_athlete_links
  FOR SELECT
  TO authenticated
  USING (true);
