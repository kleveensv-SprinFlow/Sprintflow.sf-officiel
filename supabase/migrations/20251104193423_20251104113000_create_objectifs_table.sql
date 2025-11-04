/*
  # Create objectifs table

  1. New Tables
    - `objectifs`
      - `id` (uuid, primary key) - Identifiant unique de l'objectif
      - `user_id` (uuid, foreign key) - Référence à l'utilisateur
      - `exercice_id` (uuid, foreign key) - Référence à l'exercice
      - `valeur` (double precision) - Valeur de l'objectif
      - `created_at` (timestamptz) - Date de création

  2. Security
    - Enable RLS on `objectifs` table
    - Add policy for users to read their own objectifs
    - Add policy for users to insert their own objectifs
    - Add policy for users to update their own objectifs
    - Add policy for users to delete their own objectifs
    - Add policy for coaches to read their athletes' objectifs

  3. Foreign Keys
    - `user_id` references `profiles(id)` with CASCADE delete
    - `exercice_id` references `exercices_reference(id)` with CASCADE delete
*/

-- Create the objectifs table
CREATE TABLE IF NOT EXISTS public.objectifs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    exercice_id uuid NOT NULL,
    valeur double precision NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT objectifs_pkey PRIMARY KEY (id),
    CONSTRAINT objectifs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT objectifs_exercice_id_fkey FOREIGN KEY (exercice_id) REFERENCES public.exercices_reference(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.objectifs ENABLE ROW LEVEL SECURITY;

-- Policies for objectifs
CREATE POLICY "Les utilisateurs peuvent voir leur propre objectif"
    ON public.objectifs FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent insérer leur propre objectif"
    ON public.objectifs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre objectif"
    ON public.objectifs FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leur propre objectif"
    ON public.objectifs FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Les coachs peuvent voir les objectifs de leurs athlètes"
    ON public.objectifs FOR SELECT
    TO authenticated
    USING (is_coach_of_athlete(user_id));