/*
  # Création de fonctions RPC pour les groupes

  1. Nouvelle fonction RPC
    - `get_group_members_with_profiles` : Récupère les membres d'un groupe avec leurs profils
    - Simplifie les requêtes complexes et améliore les performances
  
  2. Sécurité
    - Fonction sécurisée avec vérification des droits
    - Accessible uniquement aux membres du groupe ou au coach
*/

-- Fonction pour récupérer les membres d'un groupe avec leurs profils
CREATE OR REPLACE FUNCTION get_group_members_with_profiles(group_id_param uuid)
RETURNS TABLE (
  id uuid,
  group_id uuid,
  athlete_id uuid,
  joined_at timestamptz,
  athlete_first_name text,
  athlete_last_name text,
  athlete_email text,
  athlete_photo_url text,
  athlete_role text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier que l'utilisateur a le droit de voir ces membres
  -- (soit il est membre du groupe, soit il est le coach)
  IF NOT EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_id_param 
    AND gm.athlete_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = group_id_param
    AND g.coach_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    gm.id,
    gm.group_id,
    gm.athlete_id,
    gm.joined_at,
    p.first_name as athlete_first_name,
    p.last_name as athlete_last_name,
    p.email as athlete_email,
    p.photo_url as athlete_photo_url,
    p.role as athlete_role
  FROM group_members gm
  LEFT JOIN profiles p ON p.id = gm.athlete_id
  WHERE gm.group_id = group_id_param
  ORDER BY gm.joined_at DESC;
END;
$$;

-- Fonction pour récupérer les groupes d'un athlète avec les infos du coach
CREATE OR REPLACE FUNCTION get_athlete_groups_with_coach(athlete_id_param uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  group_photo_url text,
  coach_id uuid,
  invitation_code text,
  max_members integer,
  created_at timestamptz,
  updated_at timestamptz,
  coach_first_name text,
  coach_last_name text,
  coach_email text,
  coach_photo_url text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Vérifier que l'utilisateur demande ses propres groupes
  IF athlete_id_param != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.description,
    g.group_photo_url,
    g.coach_id,
    g.invitation_code,
    g.max_members,
    g.created_at,
    g.updated_at,
    p.first_name as coach_first_name,
    p.last_name as coach_last_name,
    p.email as coach_email,
    p.photo_url as coach_photo_url
  FROM groups g
  INNER JOIN group_members gm ON gm.group_id = g.id
  LEFT JOIN profiles p ON p.id = g.coach_id
  WHERE gm.athlete_id = athlete_id_param
  ORDER BY gm.joined_at DESC;
END;
$$;
