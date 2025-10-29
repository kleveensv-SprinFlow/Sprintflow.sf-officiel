/*
  # Complete Sprintflow Schema

  Cette migration unique contient tout le schéma nécessaire pour Sprintflow.
  Elle gère les conflits en utilisant CREATE IF NOT EXISTS et DROP IF EXISTS.
*/

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fonctions utilitaires
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM groups WHERE invitation_code = code) INTO exists;
    IF NOT exists THEN EXIT; END IF;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.invitation_code IS NULL THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, email, discipline, sexe, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete'),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    NEW.raw_user_meta_data->>'discipline',
    NEW.raw_user_meta_data->>'sexe',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, profiles.last_name),
    email = COALESCE(EXCLUDED.email, profiles.email);
  RETURN NEW;
END;
$$;

-- Ajouter les colonnes manquantes aux profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'discipline') THEN
    ALTER TABLE profiles ADD COLUMN discipline text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'sexe') THEN
    ALTER TABLE profiles ADD COLUMN sexe text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tour_cou_cm') THEN
    ALTER TABLE profiles ADD COLUMN tour_cou_cm numeric(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tour_taille_cm') THEN
    ALTER TABLE profiles ADD COLUMN tour_taille_cm numeric(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'tour_hanches_cm') THEN
    ALTER TABLE profiles ADD COLUMN tour_hanches_cm numeric(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'taille_derniere_modif') THEN
    ALTER TABLE profiles ADD COLUMN taille_derniere_modif timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'measurement_system') THEN
    ALTER TABLE profiles ADD COLUMN measurement_system text DEFAULT 'metric' CHECK (measurement_system IN ('metric', 'imperial'));
  END IF;
END $$;

-- Tables de chat de groupe
CREATE TABLE IF NOT EXISTS group_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Tables de notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'reminder')),
  is_read boolean NOT NULL DEFAULT false,
  action_url text,
  action_label text,
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Tables de partenariats
CREATE TABLE IF NOT EXISTS partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  photo_url text,
  promo_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tables d'exercices
CREATE TABLE IF NOT EXISTS exercices_reference (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT UNIQUE NOT NULL,
  nom_alternatif TEXT[] DEFAULT '{}',
  categorie TEXT NOT NULL CHECK (categorie IN ('halterophilie', 'muscu_bas', 'muscu_haut', 'unilateral', 'pliometrie', 'lancers')),
  groupe_exercice TEXT NOT NULL,
  bareme_intermediaire NUMERIC(6,2) NOT NULL,
  bareme_avance NUMERIC(6,2) NOT NULL,
  bareme_elite NUMERIC(6,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercices_personnalises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  categorie TEXT NOT NULL,
  groupe_exercice TEXT,
  exercice_reference_id UUID REFERENCES exercices_reference(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tables d'entraînement
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  title text,
  tag_seance text CHECK (tag_seance IN ('vitesse_max', 'endurance_lactique', 'technique_recup')),
  courses_json jsonb DEFAULT '[]'::jsonb,
  muscu_json jsonb DEFAULT '[]'::jsonb,
  autres_activites text,
  echelle_effort integer CHECK (echelle_effort BETWEEN 1 AND 10),
  notes text,
  meteo text,
  temperature numeric(4,1),
  duration_minutes integer DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exercise_name text,
  exercice_id UUID REFERENCES exercices_reference(id),
  weight_kg decimal(6,2),
  reps integer,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS session_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  session_type text NOT NULL CHECK (session_type IN ('training', 'recovery', 'rest')),
  duration_minutes integer DEFAULT 60,
  intensity text CHECK (intensity IN ('low', 'medium', 'high')) DEFAULT 'medium',
  exercises jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tables de nutrition
CREATE TABLE IF NOT EXISTS donnees_corporelles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  poids_kg decimal(5,2) NOT NULL,
  masse_grasse_pct decimal(4,2),
  masse_musculaire_kg decimal(5,2),
  muscle_squelettique_kg decimal(5,2),
  created_at timestamptz DEFAULT now(),
  UNIQUE(athlete_id, date)
);

CREATE TABLE IF NOT EXISTS objectifs_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type_jour text NOT NULL CHECK (type_jour IN ('haut', 'bas', 'repos')),
  kcal_objectif integer NOT NULL DEFAULT 0,
  proteines_objectif_g integer NOT NULL DEFAULT 0,
  glucides_objectif_g integer NOT NULL DEFAULT 0,
  lipides_objectif_g integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(athlete_id, type_jour)
);

CREATE TABLE IF NOT EXISTS aliments_favoris (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom text NOT NULL,
  kcal_100g decimal(6,2) NOT NULL,
  proteines_100g decimal(5,2) NOT NULL,
  glucides_100g decimal(5,2) NOT NULL,
  lipides_100g decimal(5,2) NOT NULL,
  fibres_100g decimal(5,2),
  sodium_100mg decimal(6,2),
  potassium_100mg decimal(6,2),
  source_type text CHECK (source_type IN ('off', 'personnel', 'recette')),
  source_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS aliments_personnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom text NOT NULL,
  kcal_100g decimal(6,2) NOT NULL,
  proteines_100g decimal(5,2) NOT NULL,
  glucides_100g decimal(5,2) NOT NULL,
  lipides_100g decimal(5,2) NOT NULL,
  fibres_100g decimal(5,2),
  sodium_100mg decimal(6,2),
  potassium_100mg decimal(6,2),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recettes_personnelles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom text NOT NULL,
  ingredients jsonb NOT NULL,
  poids_total_recette_g decimal(7,2) NOT NULL,
  nombre_portions_default integer DEFAULT 1,
  kcal_total decimal(7,2) NOT NULL,
  proteines_total_g decimal(6,2) NOT NULL,
  glucides_total_g decimal(6,2) NOT NULL,
  lipides_total_g decimal(6,2) NOT NULL,
  fibres_total_g decimal(6,2),
  sodium_total_mg decimal(7,2),
  potassium_total_mg decimal(7,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS journal_alimentaire (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  tag_moment text CHECK (tag_moment IN ('pre_entrainement', 'post_entrainement', 'repas_1', 'repas_2', 'pre_sommeil')),
  aliment_nom text NOT NULL,
  quantite_g decimal(7,2) NOT NULL,
  kcal decimal(7,2) NOT NULL,
  proteines_g decimal(6,2) NOT NULL,
  glucides_g decimal(6,2) NOT NULL,
  lipides_g decimal(6,2) NOT NULL,
  fibres_g decimal(6,2),
  sodium_mg decimal(7,2),
  potassium_mg decimal(7,2),
  hydratation_ml integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Table de sommeil
CREATE TABLE IF NOT EXISTS sleep_data (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  duration_hours real,
  quality_rating smallint,
  notes text,
  UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_group_id ON group_chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date DESC);
CREATE INDEX IF NOT EXISTS idx_workouts_courses_json ON workouts USING GIN (courses_json);
CREATE INDEX IF NOT EXISTS idx_workouts_muscu_json ON workouts USING GIN (muscu_json);
CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(user_id);
CREATE INDEX IF NOT EXISTS idx_records_exercice_id ON records(exercice_id);
CREATE INDEX IF NOT EXISTS idx_exercices_categorie ON exercices_reference(categorie);
CREATE INDEX IF NOT EXISTS idx_exercices_personnalises_athlete_id ON exercices_personnalises(athlete_id);
CREATE INDEX IF NOT EXISTS idx_session_templates_coach_id ON session_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_donnees_corporelles_athlete_date ON donnees_corporelles(athlete_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_data_user_date ON sleep_data(user_id, date DESC);

-- Triggers
DROP TRIGGER IF EXISTS groups_invitation_code_trigger ON groups;
CREATE TRIGGER groups_invitation_code_trigger BEFORE INSERT ON groups FOR EACH ROW EXECUTE FUNCTION set_invitation_code();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS workouts_updated_at_trigger ON workouts;
CREATE TRIGGER workouts_updated_at_trigger BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS records_updated_at_trigger ON records;
CREATE TRIGGER records_updated_at_trigger BEFORE UPDATE ON records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS partnerships_updated_at_trigger ON partnerships;
CREATE TRIGGER partnerships_updated_at_trigger BEFORE UPDATE ON partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercices_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercices_personnalises ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE donnees_corporelles ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectifs_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliments_favoris ENABLE ROW LEVEL SECURITY;
ALTER TABLE aliments_personnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE recettes_personnelles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_alimentaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_data ENABLE ROW LEVEL SECURITY;

-- Policies (avec DROP IF EXISTS pour éviter les conflits)
DROP POLICY IF EXISTS "Group members can read group messages" ON group_chat_messages;
CREATE POLICY "Group members can read group messages" ON group_chat_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM groups g WHERE g.id = group_chat_messages.group_id AND g.coach_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_chat_messages.group_id AND gm.athlete_id = auth.uid())
);

DROP POLICY IF EXISTS "Group members can send messages" ON group_chat_messages;
CREATE POLICY "Group members can send messages" ON group_chat_messages FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND (
    EXISTS (SELECT 1 FROM groups g WHERE g.id = group_chat_messages.group_id AND g.coach_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_chat_messages.group_id AND gm.athlete_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
CREATE POLICY "Users can read their own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own notifications" ON notifications;
CREATE POLICY "Users can create their own notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Developer can manage all notifications" ON notifications;
CREATE POLICY "Developer can manage all notifications" ON notifications FOR ALL TO authenticated USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid) WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

DROP POLICY IF EXISTS "Allow authenticated users to view partnerships" ON partnerships;
CREATE POLICY "Allow authenticated users to view partnerships" ON partnerships FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow developer to manage partnerships" ON partnerships;
CREATE POLICY "Allow developer to manage partnerships" ON partnerships FOR ALL TO authenticated USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid) WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);

DROP POLICY IF EXISTS "workouts_full_access" ON workouts;
CREATE POLICY "workouts_full_access" ON workouts FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "records_full_access" ON records;
CREATE POLICY "records_full_access" ON records FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Lecture exercices pour tous" ON exercices_reference;
CREATE POLICY "Lecture exercices pour tous" ON exercices_reference FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can view own custom exercises" ON exercices_personnalises;
CREATE POLICY "Users can view own custom exercises" ON exercices_personnalises FOR SELECT TO authenticated USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Users can create own custom exercises" ON exercices_personnalises;
CREATE POLICY "Users can create own custom exercises" ON exercices_personnalises FOR INSERT TO authenticated WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Users can update own custom exercises" ON exercices_personnalises;
CREATE POLICY "Users can update own custom exercises" ON exercices_personnalises FOR UPDATE TO authenticated USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Users can delete own custom exercises" ON exercices_personnalises;
CREATE POLICY "Users can delete own custom exercises" ON exercices_personnalises FOR DELETE TO authenticated USING (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Coaches can manage their own session templates" ON session_templates;
CREATE POLICY "Coaches can manage their own session templates" ON session_templates FOR ALL TO authenticated USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "Athletes can manage own body data" ON donnees_corporelles;
CREATE POLICY "Athletes can manage own body data" ON donnees_corporelles FOR ALL TO authenticated USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can manage own objectifs" ON objectifs_presets;
CREATE POLICY "Athletes can manage own objectifs" ON objectifs_presets FOR ALL TO authenticated USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can manage own favorite foods" ON aliments_favoris;
CREATE POLICY "Athletes can manage own favorite foods" ON aliments_favoris FOR ALL TO authenticated USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can manage own custom foods" ON aliments_personnels;
CREATE POLICY "Athletes can manage own custom foods" ON aliments_personnels FOR ALL TO authenticated USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can manage own recipes" ON recettes_personnelles;
CREATE POLICY "Athletes can manage own recipes" ON recettes_personnelles FOR ALL TO authenticated USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Athletes can manage own food diary" ON journal_alimentaire;
CREATE POLICY "Athletes can manage own food diary" ON journal_alimentaire FOR ALL TO authenticated USING (auth.uid() = athlete_id) WITH CHECK (auth.uid() = athlete_id);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sleep_data;
CREATE POLICY "Enable insert for authenticated users only" ON sleep_data FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON sleep_data;
CREATE POLICY "Enable read access for users based on user_id" ON sleep_data FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable update for users based on user_id" ON sleep_data;
CREATE POLICY "Enable update for users based on user_id" ON sleep_data FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON sleep_data;
CREATE POLICY "Enable delete for users based on user_id" ON sleep_data FOR DELETE USING (auth.uid() = user_id);

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('group-photos', 'group-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('partner-photos', 'partner-photos', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own profile photos" ON storage.objects;
CREATE POLICY "Users can upload their own profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
CREATE POLICY "Users can update their own profile photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Profile photos are publicly readable" ON storage.objects;
CREATE POLICY "Profile photos are publicly readable" ON storage.objects FOR SELECT TO public USING (bucket_id = 'profile-photos');

-- Seed Data
INSERT INTO exercices_reference (nom, categorie, groupe_exercice, bareme_intermediaire, bareme_avance, bareme_elite, description) VALUES
('Épaulé (Clean)', 'halterophilie', 'Groupe Clean', 1.0, 1.35, 1.6, 'Explosivité (Force-Vitesse)'),
('Power Clean', 'halterophilie', 'Groupe Clean', 1.0, 1.3, 1.5, 'Explosivité (Vitesse-Force)'),
('Arraché (Snatch)', 'halterophilie', 'Groupe Snatch', 0.8, 1.0, 1.25, 'Explosivité (Vitesse-Force)'),
('Épaulé-jeté (Clean & Jerk)', 'halterophilie', 'Groupe Clean & Jerk', 1.2, 1.5, 1.75, 'Explosivité (Force-Vitesse)'),
('Squat Arrière (Back Squat)', 'muscu_bas', 'Groupe Squat', 1.4, 1.8, 2.2, 'Force Maximale'),
('Squat Avant (Front Squat)', 'muscu_bas', 'Groupe Squat', 1.2, 1.5, 1.8, 'Force Maximale'),
('Soulevé de Terre (Deadlift)', 'muscu_bas', 'Groupe SDT', 1.7, 2.2, 2.6, 'Force Maximale'),
('Soulevé de Terre Roumain (RDL)', 'muscu_bas', 'Groupe SDT Accessoire', 1.3, 1.6, 1.9, 'Force (Chaîne Postérieure)'),
('Hip Thrust', 'muscu_bas', 'Groupe Hip Thrust', 1.8, 2.3, 3.0, 'Force (Chaîne Postérieure)'),
('Presse à Cuisses (Leg Press)', 'muscu_bas', 'Groupe Presse', 2.8, 3.5, 4.5, 'Force (Hypertrophie)'),
('Good Mornings', 'muscu_bas', 'Groupe Acc. Post.', 0.6, 0.8, 1.0, 'Force (Stabilité)'),
('Développé Couché', 'muscu_haut', 'Groupe Couché', 1.0, 1.3, 1.5, 'Force Maximale'),
('Développé Militaire', 'muscu_haut', 'Groupe Press', 0.6, 0.8, 1.0, 'Force (Haut du Corps)'),
('Tractions Lestées', 'muscu_haut', 'Groupe Traction', 0.2, 0.4, 0.7, 'Force (Haut du Corps)'),
('Dips Lestés', 'muscu_haut', 'Groupe Dips', 0.3, 0.5, 0.8, 'Force (Haut du Corps)'),
('Squat Bulgare (Split Squat)', 'unilateral', 'Groupe Unilatéral Bas', 0.6, 0.8, 1.0, 'Force (Unilatéral)'),
('Fentes (Marchées ou Statiques)', 'unilateral', 'Groupe Unilatéral Bas', 0.5, 0.7, 0.9, 'Force (Unilatéral)'),
('Saut Vertical (Détente Sèche)', 'pliometrie', 'Groupe Saut Vertical', 50, 65, 80, 'Pliométrie'),
('Saut en Longueur (Sans Élan)', 'pliometrie', 'Groupe Saut Horizontal', 240, 270, 300, 'Pliométrie'),
('Lancer Médecine Ball (Arr. 2kg)', 'lancers', 'Groupe Lancer Léger', 6, 8, 12, 'Explosivité (Transfert)'),
('Lancer Poids (Arr. 7.26kg)', 'lancers', 'Groupe Lancer Lourd', 8, 10, 13, 'Force Explosive')
ON CONFLICT (nom) DO NOTHING;

INSERT INTO partnerships (name, description, photo_url, promo_code) VALUES
('Nike Performance', 'Équipements sportifs de haute performance.', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 'ATHLETE20'),
('Protein World', 'Compléments alimentaires et nutrition sportive.', 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=800', 'NUTRITION15'),
('TechnoGym', 'Équipements de fitness innovants.', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800', 'TECHNO10')
ON CONFLICT (id) DO NOTHING;
