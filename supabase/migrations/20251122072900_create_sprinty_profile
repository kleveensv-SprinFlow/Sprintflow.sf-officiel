-- Create Sprinty profile
DO $$
DECLARE
  sprinty_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Attempt to insert a dummy user into auth.users to satisfy FK constraints
  BEGIN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      sprinty_id,
      'authenticated',
      'authenticated',
      'sprinty@sprintflow.run',
      '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12', -- Placeholder hash
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if user already exists or permission denied
    NULL;
  END;

  -- Now insert the profile
  -- Removing full_name as it is a generated column
  INSERT INTO public.profiles (
    id,
    role,
    first_name,
    last_name,
    photo_url,
    email,
    created_at,
    updated_at,
    role_specifique
  ) VALUES (
    sprinty_id,
    'coach',
    'Sprinty',
    'AI',
    'https://raw.githubusercontent.com/stackblitz/stackblitz-images/main/sprinty-avatar.png',
    'sprinty@sprintflow.run',
    NOW(),
    NOW(),
    'Assistant Virtuel'
  )
  ON CONFLICT (id) DO NOTHING;

END $$;
