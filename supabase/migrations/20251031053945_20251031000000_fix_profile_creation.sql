/*
  # Fix Profile Creation on Signup

  1. Changes
    - Create trigger function to automatically create profile when new user signs up
    - Function bypasses RLS since it runs with SECURITY DEFINER
    - Drops old INSERT policy that was blocking signups
    - Creates new policy allowing service role to insert profiles

  2. Security
    - Trigger runs as database owner (bypasses RLS)
    - Only creates profile with safe default values
    - Maintains RLS for all other operations
*/

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    'athlete',
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create new INSERT policy for service role only
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry when a new user signs up';
