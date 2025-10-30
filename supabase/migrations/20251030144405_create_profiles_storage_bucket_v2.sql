/*
  # Création bucket Storage pour les photos de profil

  1. Nouveau bucket
    - `profiles` - Stockage public des photos de profil
    - Limite de taille: 5MB par fichier
    - Types MIME autorisés: images uniquement

  2. Sécurité RLS
    - Lecture publique (pour afficher les avatars)
    - Upload: utilisateurs authentifiés uniquement (leur propre avatar)
    - Update/Delete: uniquement son propre avatar
*/

-- Créer le bucket profiles s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Politique 1: Tout le monde peut voir les avatars (lecture publique)
CREATE POLICY "Public avatar access"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Politique 2: Les utilisateurs authentifiés peuvent uploader leur propre avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE auth.uid()::text || '%'
);

-- Politique 3: Les utilisateurs peuvent mettre à jour leur propre avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE auth.uid()::text || '%'
)
WITH CHECK (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE auth.uid()::text || '%'
);

-- Politique 4: Les utilisateurs peuvent supprimer leur propre avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles'
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE auth.uid()::text || '%'
);