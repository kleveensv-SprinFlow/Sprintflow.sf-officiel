/*
  # Fonction RPC pour calculer les objectifs nutritionnels

  1. Fonction PostgreSQL callable depuis le client
    - Permet d'appeler facilement calculer_objectifs depuis l'application
    - Valide les données avant l'appel
    - Retourne le résultat de l'Edge Function

  2. Sécurité
    - Accessible uniquement aux utilisateurs authentifiés
    - Chaque utilisateur ne peut calculer que ses propres objectifs
*/

CREATE OR REPLACE FUNCTION rpc_calculer_objectifs(
  p_objectif_saison text,
  p_poids_cible_kg numeric,
  p_date_cible date
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_athlete_id uuid;
  v_profile record;
  v_result jsonb;
BEGIN
  -- Récupérer l'ID de l'utilisateur authentifié
  v_athlete_id := auth.uid();
  
  IF v_athlete_id IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;

  -- Valider le type d'objectif
  IF p_objectif_saison NOT IN ('preparation', 'maintien', 'affutage') THEN
    RAISE EXCEPTION 'objectif_saison invalide. Valeurs acceptées: preparation, maintien, affutage';
  END IF;

  -- Mettre à jour le profil de l'athlète
  UPDATE profiles
  SET 
    objectif_saison = p_objectif_saison,
    poids_cible_kg = p_poids_cible_kg,
    date_cible = p_date_cible
  WHERE id = v_athlete_id;

  -- Récupérer les informations du profil pour le calcul
  SELECT 
    sexe,
    taille_cm,
    weight as poids_actuel
  INTO v_profile
  FROM profiles
  WHERE id = v_athlete_id;

  -- Construire le résultat de succès
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Objectif de saison enregistré. Appelez l''Edge Function calculer_objectifs pour calculer les macros.',
    'profile_updated', true,
    'athlete_id', v_athlete_id,
    'data', jsonb_build_object(
      'objectif_saison', p_objectif_saison,
      'poids_cible_kg', p_poids_cible_kg,
      'date_cible', p_date_cible,
      'sexe', v_profile.sexe,
      'taille_cm', v_profile.taille_cm,
      'poids_actuel', v_profile.poids_actuel
    )
  );

  RETURN v_result;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION rpc_calculer_objectifs(text, numeric, date) TO authenticated;

COMMENT ON FUNCTION rpc_calculer_objectifs IS 'Met à jour l''objectif de saison dans le profil. L''application doit ensuite appeler l''Edge Function calculer_objectifs pour calculer les macros.';