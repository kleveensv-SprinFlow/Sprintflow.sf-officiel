-- Supprimer les anciennes politiques RLS sur la table records
DROP POLICY IF EXISTS "Users can view own records" ON records;
DROP POLICY IF EXISTS "Users can insert own records" ON records;
DROP POLICY IF EXISTS "Users can update own records" ON records;
DROP POLICY IF EXISTS "Users can delete own records" ON records;
DROP POLICY IF EXISTS "Coaches can view athlete records" ON records;

-- Activer RLS sur la table records
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Politique: Les utilisateurs peuvent voir leurs propres records
CREATE POLICY "Users can view own records"
  ON records
  FOR SELECT
  USING (auth.uid() = user_id);

-- Politique: Les coachs peuvent voir les records de leurs athlètes
CREATE POLICY "Coaches can view athlete records"
  ON records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM group_members gm
      JOIN groups g ON gm.group_id = g.id
      WHERE gm.athlete_id = records.user_id
        AND g.coach_id = auth.uid()
    )
  );

-- Politique: Les utilisateurs peuvent insérer leurs propres records
CREATE POLICY "Users can insert own records"
  ON records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent mettre à jour leurs propres records
CREATE POLICY "Users can update own records"
  ON records
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique: Les utilisateurs peuvent supprimer leurs propres records
CREATE POLICY "Users can delete own records"
  ON records
  FOR DELETE
  USING (auth.uid() = user_id);

-- Créer ou remplacer la fonction RPC get_user_records_split
CREATE OR REPLACE FUNCTION get_user_records_split(user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Vérifier que l'utilisateur demande ses propres records OU est coach de cet athlète
  IF user_id_param != auth.uid() AND NOT EXISTS (
    SELECT 1 
    FROM group_members gm
    JOIN groups g ON gm.group_id = g.id
    WHERE gm.athlete_id = user_id_param
      AND g.coach_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You can only access your own records or your athletes records';
  END IF;

  -- Construire le JSON avec les records séparés
  SELECT json_build_object(
    'strength_records', COALESCE(
      (SELECT json_agg(row_to_json(r.*))
       FROM records r
       WHERE r.user_id = user_id_param
         AND r.type = 'exercise'
       ORDER BY r.date DESC),
      '[]'::json
    ),
    'track_records', COALESCE(
      (SELECT json_agg(row_to_json(r.*))
       FROM records r
       WHERE r.user_id = user_id_param
         AND r.type IN ('run', 'jump', 'throw')
       ORDER BY r.date DESC),
      '[]'::json
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION get_user_records_split(UUID) TO authenticated;