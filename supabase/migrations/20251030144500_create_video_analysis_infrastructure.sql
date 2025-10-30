/*
  # Create Video Analysis Infrastructure

  1. New Tables
    - `video_analysis_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `exercise_name` (text)
      - `video_url` (text)
      - `analysis_status` (text, CHECK constraint)
      - `result_json` (jsonb)
      - `created_at` (timestamptz)
      - `shared_with_coach` (boolean)

  2. Storage Buckets
    - `ia-models` (public bucket for AI models)
    - `video_analysis` (public bucket for user videos)

  3. Security
    - Enable RLS on `video_analysis_logs` table
    - Athletes can manage their own analysis logs
    - Coaches can view shared analysis logs from their athletes
    - Storage policies for buckets

  4. Notes
    - Models are read-only for everyone
    - Videos are managed by users, viewable by coaches
*/

-- 1. Create storage buckets for video analysis feature

-- Create a bucket for public AI models, accessible by everyone.
-- The models are read-only for anonymous and authenticated users.
INSERT INTO storage.buckets (id, name, public)
VALUES ('ia-models', 'ia-models', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Create a bucket for user-uploaded videos for analysis.
-- Videos should be publicly accessible via URL for easy viewing.
INSERT INTO storage.buckets (id, name, public)
VALUES ('video_analysis', 'video_analysis', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 2. Create the video_analysis_logs table
-- This table will store metadata and results for each video analysis.
CREATE TABLE IF NOT EXISTS public.video_analysis_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    video_url TEXT,
    analysis_status TEXT NOT NULL CHECK (analysis_status IN ('PENDING', 'COMPLETED', 'ERROR')),
    result_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    shared_with_coach BOOLEAN DEFAULT FALSE
);

-- Add comments for clarity
COMMENT ON TABLE public.video_analysis_logs IS 'Stores logs and results of video analysis performed by users.';
COMMENT ON COLUMN public.video_analysis_logs.user_id IS 'The user who performed the analysis.';
COMMENT ON COLUMN public.video_analysis_logs.video_url IS 'Public URL to the video in the video_analysis bucket.';
COMMENT ON COLUMN public.video_analysis_logs.analysis_status IS 'The current status of the analysis job.';
COMMENT ON COLUMN public.video_analysis_logs.result_json IS 'JSON object containing the analysis results, e.g., {"profondeur_atteinte": true}.';
COMMENT ON COLUMN public.video_analysis_logs.shared_with_coach IS 'Flag to indicate if the analysis has been shared with the coach.';

-- 3. Enable Row Level Security (RLS) on the new table
ALTER TABLE public.video_analysis_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for the video_analysis_logs table

-- Athletes can manage their own analysis logs
CREATE POLICY "Athletes can manage their own analysis logs"
ON public.video_analysis_logs
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Coaches can view the analysis logs of their athletes that have been explicitly shared.
CREATE POLICY "Coaches can view shared analysis logs of their athletes"
ON public.video_analysis_logs
FOR SELECT
TO authenticated
USING (
  shared_with_coach = TRUE AND
  EXISTS (
    SELECT 1
    FROM public.group_members gm
    JOIN public.groups g ON gm.group_id = g.id
    WHERE
      gm.athlete_id = video_analysis_logs.user_id AND
      g.coach_id = auth.uid()
  )
);

-- 5. Create RLS policies for storage buckets

-- Policies for ia-models bucket (read-only for everyone)
CREATE POLICY "Allow public read access to AI models"
ON storage.objects FOR SELECT
TO authenticated, anon
USING ( bucket_id = 'ia-models' );

-- Policies for video_analysis bucket
CREATE POLICY "Athletes can manage their own videos"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'video_analysis' AND owner = auth.uid() )
WITH CHECK ( bucket_id = 'video_analysis' AND owner = auth.uid() );

CREATE POLICY "Coaches can view their athletes shared videos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'video_analysis' AND
    owner IN (
        SELECT gm.athlete_id
        FROM public.group_members gm
        JOIN public.groups g ON gm.group_id = g.id
        WHERE g.coach_id = auth.uid()
    )
);
