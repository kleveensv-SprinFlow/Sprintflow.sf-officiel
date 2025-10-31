-- Ce fichier corrige la politique de sécurité (RLS) sur la table 'profiles'
-- pour autoriser les utilisateurs à mettre à jour leur propre avatar_url.

-- 1. Supprimer l'ancienne politique de mise à jour restrictive.
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 2. Créer une nouvelle politique de mise à jour permissive pour les utilisateurs sur leur propre profil.
-- Cette politique autorise la mise à jour de n'importe quelle colonne tant que l'ID correspond.
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
