CREATE OR REPLACE FUNCTION public.join_group_with_code(invitation_code_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_group RECORD;
    current_user_id UUID := auth.uid();
    member_count INTEGER;
    already_member_count INTEGER;
BEGIN
    -- 1. Trouver le groupe correspondant au code d'invitation
    SELECT id, max_members INTO target_group FROM public.groups WHERE invitation_code = invitation_code_param;

    IF target_group.id IS NULL THEN
        RETURN json_build_object('status', 'error', 'message', 'Code d''invitation invalide.');
    END IF;

    -- 2. Vérifier si l'utilisateur est déjà dans un groupe
    SELECT count(*) INTO already_member_count FROM public.group_members WHERE athlete_id = current_user_id;
    IF already_member_count > 0 THEN
        RETURN json_build_object('status', 'error', 'message', 'Vous êtes déjà membre d''un groupe.');
    END IF;

    -- 3. Vérifier si le nombre maximum de membres est atteint
    IF target_group.max_members IS NOT NULL THEN
        SELECT count(*) INTO member_count FROM public.group_members WHERE group_id = target_group.id;
        IF member_count >= target_group.max_members THEN
            RETURN json_build_object('status', 'error', 'message', 'Le groupe a atteint son nombre maximum de membres.');
        END IF;
    END IF;

    -- 4. Ajouter l'athlète au groupe
    INSERT INTO public.group_members (group_id, athlete_id)
    VALUES (target_group.id, current_user_id);

    RETURN json_build_object('status', 'success', 'message', 'Vous avez rejoint le groupe avec succès !');
END;
$$;
