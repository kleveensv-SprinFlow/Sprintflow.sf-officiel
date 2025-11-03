/*
  # Créer les profils manquants pour utilisateurs confirmés

  1. Objectif
    - Créer automatiquement les profils pour les utilisateurs qui ont confirmé leur email
      mais n'ont pas encore de profil

  2. Données utilisées
    - Récupérer les données depuis raw_user_meta_data
    - Ne pas inclure full_name car c'est une colonne générée
*/

-- Créer les profils manquants pour les utilisateurs confirmés
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  role_specifique,
  date_de_naissance,
  discipline,
  sexe,
  height,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'athlete'),
  u.raw_user_meta_data->>'role_specifique',
  (u.raw_user_meta_data->>'date_de_naissance')::date,
  u.raw_user_meta_data->>'discipline',
  u.raw_user_meta_data->>'sexe',
  (u.raw_user_meta_data->>'height')::integer,
  now(),
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email_confirmed_at IS NOT NULL
  AND p.id IS NULL
ON CONFLICT (id) DO NOTHING;
