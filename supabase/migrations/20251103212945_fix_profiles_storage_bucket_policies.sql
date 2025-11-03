/*
  # Correction des politiques de stockage pour le bucket profiles

  1. Problème
    - Les utilisateurs ne peuvent pas uploader leur photo de profil
    - Les politiques RLS du bucket 'profiles' sont manquantes ou incorrectes
  
  2. Solution
    - Supprimer les anciennes politiques si elles existent
    - Créer de nouvelles politiques permettant :
      - Upload/Update : uniquement pour son propre dossier (avatars/{user_id}.*)
      - Read : public pour tous
      - Delete : uniquement son propre avatar
*/

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

-- Permettre à tous de voir les avatars (lecture publique)
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profiles');

-- Permettre aux utilisateurs authentifiés d'uploader leur propre avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE auth.uid()::text || '.%'
);

-- Permettre aux utilisateurs authentifiés de mettre à jour leur propre avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE auth.uid()::text || '.%'
)
WITH CHECK (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE auth.uid()::text || '.%'
);

-- Permettre aux utilisateurs authentifiés de supprimer leur propre avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profiles' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND (storage.filename(name)) LIKE auth.uid()::text || '.%'
);
