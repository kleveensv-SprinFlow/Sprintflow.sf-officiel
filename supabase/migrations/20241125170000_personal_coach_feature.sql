-- 1. Add personal_coach_code to profiles table
ALTER TABLE public.profiles
ADD COLUMN personal_coach_code TEXT UNIQUE;

-- Function to generate a random code
CREATE OR REPLACE FUNCTION generate_random_code(length integer)
RETURNS text AS $$
DECLARE
  chars text[] := '{A,B,C,D,E,F,G,H,I,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z,1,2,3,4,5,6,7,8,9}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..length LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set the code for new coaches
CREATE OR REPLACE FUNCTION set_personal_coach_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'coach' THEN
    NEW.personal_coach_code := generate_random_code(6);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_personal_coach_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_personal_coach_code();

-- 2. Create personal_coach_links table
CREATE TABLE IF NOT EXISTS public.personal_coach_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (athlete_id, coach_id)
);

-- 3. Create RPC function to join a personal coach
CREATE OR REPLACE FUNCTION join_personal_coach(p_code TEXT)
RETURNS JSON AS $$
DECLARE
    v_coach_id UUID;
    v_athlete_id UUID := auth.uid();
    v_link_id UUID;
BEGIN
    -- Find coach by code
    SELECT id INTO v_coach_id FROM public.profiles WHERE personal_coach_code = p_code AND role = 'coach';

    -- Check if coach exists
    IF v_coach_id IS NULL THEN
        RETURN json_build_object('success', false, 'message', 'Invalid coach code.');
    END IF;
    
    -- Check if athlete is trying to add themselves
    IF v_coach_id = v_athlete_id THEN
        RETURN json_build_object('success', false, 'message', 'You cannot add yourself as a coach.');
    END IF;

    -- Create the link
    BEGIN
        INSERT INTO public.personal_coach_links (athlete_id, coach_id)
        VALUES (v_athlete_id, v_coach_id)
        RETURNING id INTO v_link_id;
    EXCEPTION WHEN unique_violation THEN
        RETURN json_build_object('success', false, 'message', 'You are already linked with this coach.');
    END;

    RETURN json_build_object('success', true, 'message', 'Successfully joined coach.', 'link_id', v_link_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create RPC function to leave a personal coach
CREATE OR REPLACE FUNCTION leave_personal_coach(p_coach_id UUID)
RETURNS JSON AS $$
DECLARE
    v_athlete_id UUID := auth.uid();
BEGIN
    DELETE FROM public.personal_coach_links
    WHERE athlete_id = v_athlete_id AND coach_id = p_coach_id;

    IF FOUND THEN
        RETURN json_build_object('success', true, 'message', 'You have left your personal coach.');
    ELSE
        RETURN json_build_object('success', false, 'message', 'Link not found.');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Create RPC function to leave a group
DROP FUNCTION IF EXISTS leave_group(uuid);
CREATE OR REPLACE FUNCTION leave_group(p_group_id UUID)
RETURNS JSON AS $$
DECLARE
    v_athlete_id UUID := auth.uid();
BEGIN
    DELETE FROM public.group_members
    WHERE athlete_id = v_athlete_id AND group_id = p_group_id;

    IF FOUND THEN
        RETURN json_build_object('success', true, 'message', 'You have left the group.');
    ELSE
        RETURN json_build_object('success', false, 'message', 'Group membership not found.');
    END IF;
END;
$$ LANGUAGE plpgsql;


-- 6. Add RLS policies for personal_coach_links
ALTER TABLE public.personal_coach_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Athletes can see their own links"
ON public.personal_coach_links
FOR SELECT
USING (auth.uid() = athlete_id);

CREATE POLICY "Coaches can see links of their athletes"
ON public.personal_coach_links
FOR SELECT
USING (auth.uid() = coach_id);

CREATE POLICY "Athletes can create links for themselves"
ON public.personal_coach_links
FOR INSERT
WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "Athletes can delete their own links"
ON public.personal_coach_links
FOR DELETE
USING (auth.uid() = athlete_id);

-- Allow coaches to read the personal_coach_code of other coaches
CREATE POLICY "Allow authenticated users to read coach codes"
ON public.profiles
FOR SELECT
USING (role = 'coach');
