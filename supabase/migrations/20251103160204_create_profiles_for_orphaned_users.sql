/*
  # Créer des profils pour les utilisateurs orphelins
  
  1. Problème
    - Certains utilisateurs existent dans auth.users mais n'ont pas de profil
    - Cela arrive quand la création du profil échoue après l'inscription
    
  2. Solution
    - Créer automatiquement des profils pour tous les utilisateurs sans profil
    - Utiliser les données de auth.users.raw_user_meta_data si disponibles
    
  3. Notes
    - Cette migration est idempotente (peut être exécutée plusieurs fois)
    - Les profils créés auront des valeurs par défaut pour les champs manquants
*/

-- Créer des profils pour les utilisateurs orphelins
INSERT INTO public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  discipline,
  sexe,
  height,
  date_de_naissance
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Utilisateur'),
  COALESCE(au.raw_user_meta_data->>'last_name', ''),
  COALESCE(au.raw_user_meta_data->>'role', 'athlete'),
  '',
  NULL,
  NULL,
  NULL
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
