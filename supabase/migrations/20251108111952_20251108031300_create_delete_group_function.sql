/*
  # Fonction de suppression de groupe

  1. Nouvelle Fonction
    - `delete_group(group_id_param uuid)`
      - Vérifie que l'utilisateur est le coach du groupe
      - Supprime d'abord les membres du groupe (table group_members)
      - Supprime ensuite le groupe lui-même (table groups)
      - Lève une exception si l'accès n'est pas autorisé

  2. Sécurité
    - Fonction SECURITY DEFINER pour exécuter avec les privilèges du propriétaire
    - Vérifie que auth.uid() correspond au coach_id du groupe
    - Permission EXECUTE accordée aux utilisateurs authentifiés

  3. Notes
    - Suppression en cascade : membres → groupe
    - Gestion d'erreur explicite pour accès non autorisé
*/

-- Fonction pour supprimer un groupe et ses membres
CREATE OR REPLACE FUNCTION public.delete_group(group_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier si l'utilisateur est le coach du groupe
  IF NOT EXISTS (
    SELECT 1
    FROM public.groups
    WHERE id = group_id_param AND coach_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé ou le groupe n''existe pas.';
  END IF;

  -- Supprimer d'abord les membres du groupe (liaisons dans group_members)
  DELETE FROM public.group_members
  WHERE group_id = group_id_param;

  -- Ensuite, supprimer le groupe lui-même
  DELETE FROM public.groups
  WHERE id = group_id_param;
END;
$$;

-- Donner les permissions à l'utilisateur authentifié pour exécuter la fonction
GRANT EXECUTE ON FUNCTION public.delete_group(uuid) TO authenticated;