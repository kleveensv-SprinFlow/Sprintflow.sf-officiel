/*
  # Create group photos storage bucket

  1. Storage
    - Create `group-photos` bucket for storing group profile pictures
    - Enable public access for group photos
    - Set up RLS policies for group photos

  2. Security
    - Only coaches can upload photos for their groups
    - Public read access for all authenticated users
*/

-- Create the group-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-photos',
  'group-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the storage.objects table for group-photos
CREATE POLICY "Group photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'group-photos');

CREATE POLICY "Coaches can upload group photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'group-photos' 
    AND auth.uid() IN (
      SELECT coach_id FROM groups 
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

CREATE POLICY "Coaches can update their group photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'group-photos' 
    AND auth.uid() IN (
      SELECT coach_id FROM groups 
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );

CREATE POLICY "Coaches can delete their group photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'group-photos' 
    AND auth.uid() IN (
      SELECT coach_id FROM groups 
      WHERE id = (storage.foldername(name))[1]::uuid
    )
  );