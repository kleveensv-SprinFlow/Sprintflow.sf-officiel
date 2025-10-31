/*
  # Add invitation code to groups table
  
  ## Changes
  1. Add invitation_code column to groups table
  2. Create function to generate random invitation codes
  3. Create trigger to auto-generate codes on group creation
  4. Backfill existing groups with codes
*/

-- Function to generate random invitation code (6 uppercase alphanumeric characters)
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6 character code (letters and numbers)
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM groups WHERE invitation_code = code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN code;
END;
$$;

-- Add invitation_code column to groups table
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS invitation_code TEXT UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_groups_invitation_code 
ON groups(invitation_code);

-- Create trigger to auto-generate invitation code on insert
CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invitation_code IS NULL THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_set_invitation_code ON groups;

CREATE TRIGGER trigger_set_invitation_code
  BEFORE INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code();

-- Backfill existing groups with invitation codes
UPDATE groups 
SET invitation_code = generate_invitation_code()
WHERE invitation_code IS NULL;
