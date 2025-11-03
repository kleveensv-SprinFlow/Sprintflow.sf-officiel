/*
  # Système de codes d'invitation et demandes d'adhésion aux groupes

  1. Nouvelles fonctionnalités
    - Codes d'invitation uniques pour chaque groupe (6 caractères alphanumériques)
    - Génération automatique des codes lors de la création d'un groupe
    - Table pour gérer les demandes d'adhésion (pending, accepted, rejected)
    
  2. Nouvelles Tables
    - `group_join_requests`
      - `id` (uuid, primary key)
      - `group_id` (uuid, référence vers groups)
      - `athlete_id` (uuid, référence vers profiles)
      - `status` (text, valeurs: 'pending', 'accepted', 'rejected')
      - `created_at` (timestamptz)
      - Contrainte unique sur (group_id, athlete_id, status)

  3. Modifications Tables Existantes
    - Ajout de `invitation_code` (text, unique) à la table `groups`

  4. Fonctions
    - `generate_random_code()` : Génère un code aléatoire de 6 caractères
    - `set_group_invitation_code()` : Trigger pour assigner un code unique à chaque nouveau groupe
    - `join_group_with_code(invitation_code)` : RPC pour qu'un athlète demande à rejoindre un groupe
    - `respond_to_join_request(request_id, new_status)` : RPC pour qu'un coach accepte/refuse une demande

  5. Sécurité
    - Enable RLS sur `group_join_requests`
    - Politiques pour que les coachs voient les demandes de leurs groupes
    - Politiques pour que les athlètes voient et créent leurs propres demandes
    - Politiques pour que les coachs mettent à jour le statut des demandes
*/

-- PARTIE 1: GESTION DES CODES D'INVITATION

-- Ajoute une colonne pour le code d'invitation à la table des groupes.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'groups' 
        AND column_name = 'invitation_code'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.groups
        ADD COLUMN invitation_code TEXT UNIQUE;
    END IF;
END $$;

-- Crée une fonction pour générer un code aléatoire de 6 caractères.
CREATE OR REPLACE FUNCTION generate_random_code()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT string_agg(
            substr('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', floor(random() * 36) + 1, 1), ''
        )
        FROM generate_series(1, 6)
    );
END;
$$ LANGUAGE plpgsql;

-- Attribue automatiquement un code d'invitation unique lors de la création d'un groupe.
CREATE OR REPLACE FUNCTION set_group_invitation_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code TEXT;
BEGIN
    IF NEW.invitation_code IS NULL THEN
        LOOP
            new_code := generate_random_code();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.groups WHERE invitation_code = new_code);
        END LOOP;
        NEW.invitation_code := new_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crée un trigger qui appelle la fonction ci-dessus avant d'insérer un nouveau groupe.
DROP TRIGGER IF EXISTS on_group_created ON public.groups;
CREATE TRIGGER on_group_created
BEFORE INSERT ON public.groups
FOR EACH ROW EXECUTE FUNCTION set_group_invitation_code();

-- Génère des codes pour les groupes existants qui n'en ont pas
DO $$
DECLARE
    group_record RECORD;
    new_code TEXT;
BEGIN
    FOR group_record IN SELECT id FROM public.groups WHERE invitation_code IS NULL
    LOOP
        LOOP
            new_code := generate_random_code();
            EXIT WHEN NOT EXISTS (SELECT 1 FROM public.groups WHERE invitation_code = new_code);
        END LOOP;
        UPDATE public.groups SET invitation_code = new_code WHERE id = group_record.id;
    END LOOP;
END $$;


-- PARTIE 2: GESTION DES DEMANDES D'ADHÉSION

-- Crée une nouvelle table pour stocker les demandes d'adhésion.
CREATE TABLE IF NOT EXISTS public.group_join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    athlete_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_pending_request UNIQUE (group_id, athlete_id, status),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- Active la sécurité au niveau des lignes (RLS) pour cette nouvelle table.
ALTER TABLE public.group_join_requests ENABLE ROW LEVEL SECURITY;

-- PARTIE 3: POLITIQUES DE SÉCURITÉ (RLS)

-- Les coachs peuvent voir les demandes pour les groupes qu'ils possèdent.
DROP POLICY IF EXISTS "Allow coach to read requests for their groups" ON public.group_join_requests;
CREATE POLICY "Allow coach to read requests for their groups"
ON public.group_join_requests
FOR SELECT
TO authenticated
USING (
    group_id IN (
        SELECT id FROM public.groups WHERE coach_id = auth.uid()
    )
);

-- Les athlètes peuvent voir leurs propres demandes.
DROP POLICY IF EXISTS "Allow athlete to read their own requests" ON public.group_join_requests;
CREATE POLICY "Allow athlete to read their own requests"
ON public.group_join_requests
FOR SELECT
TO authenticated
USING (
    athlete_id = auth.uid()
);

-- Les athlètes peuvent créer une demande (mais pas pour un groupe dont ils sont déjà membres).
DROP POLICY IF EXISTS "Allow athlete to create a join request" ON public.group_join_requests;
CREATE POLICY "Allow athlete to create a join request"
ON public.group_join_requests
FOR INSERT
TO authenticated
WITH CHECK (
    athlete_id = auth.uid() AND
    NOT EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = group_join_requests.group_id AND gm.athlete_id = auth.uid()
    )
);

-- Les coachs peuvent mettre à jour le statut des demandes pour leurs groupes.
DROP POLICY IF EXISTS "Allow coach to update request status for their groups" ON public.group_join_requests;
CREATE POLICY "Allow coach to update request status for their groups"
ON public.group_join_requests
FOR UPDATE
TO authenticated
USING (
    group_id IN (
        SELECT id FROM public.groups WHERE coach_id = auth.uid()
    )
)
WITH CHECK (
    group_id IN (
        SELECT id FROM public.groups WHERE coach_id = auth.uid()
    )
);


-- PARTIE 4: FONCTIONS SERVEUR (RPC) POUR LA LOGIQUE MÉTIER

-- Fonction pour qu'un athlète demande à rejoindre un groupe avec un code.
CREATE OR REPLACE FUNCTION join_group_with_code(invitation_code_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_group_id UUID;
    already_member BOOLEAN;
    pending_request BOOLEAN;
BEGIN
    -- 1. Trouver l'ID du groupe correspondant au code.
    SELECT id INTO target_group_id FROM public.groups WHERE invitation_code = invitation_code_param;

    IF target_group_id IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Code d''invitation invalide.');
    END IF;

    -- 2. Vérifier si l'athlète est déjà membre.
    SELECT EXISTS (
        SELECT 1 FROM public.group_members WHERE group_id = target_group_id AND athlete_id = auth.uid()
    ) INTO already_member;

    IF already_member THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Vous êtes déjà membre de ce groupe.');
    END IF;

    -- 3. Vérifier s'il y a déjà une demande en attente.
    SELECT EXISTS (
        SELECT 1 FROM public.group_join_requests WHERE group_id = target_group_id AND athlete_id = auth.uid() AND status = 'pending'
    ) INTO pending_request;
        
    IF pending_request THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Vous avez déjà une demande en attente pour ce groupe.');
    END IF;

    -- 4. Insérer la nouvelle demande.
    INSERT INTO public.group_join_requests (group_id, athlete_id, status)
    VALUES (target_group_id, auth.uid(), 'pending');

    RETURN jsonb_build_object('status', 'success', 'message', 'Votre demande a été envoyée.');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Une erreur est survenue.');
END;
$$;


-- Fonction pour qu'un coach accepte ou refuse une demande.
CREATE OR REPLACE FUNCTION respond_to_join_request(request_id_param UUID, new_status_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    request RECORD;
    target_group RECORD;
BEGIN
    -- 1. Vérifier que le statut est valide.
    IF new_status_param NOT IN ('accepted', 'rejected') THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Statut invalide.');
    END IF;

    -- 2. Récupérer la demande et vérifier les permissions du coach.
    SELECT * INTO request FROM public.group_join_requests WHERE id = request_id_param;
    
    IF request IS NULL THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Demande non trouvée.');
    END IF;
    
    SELECT * INTO target_group FROM public.groups WHERE id = request.group_id;

    IF target_group.coach_id != auth.uid() THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Permission refusée.');
    END IF;

    -- 3. Mettre à jour le statut de la demande.
    UPDATE public.group_join_requests
    SET status = new_status_param
    WHERE id = request_id_param;

    -- 4. Si la demande est acceptée, ajouter l'athlète à la table des membres.
    IF new_status_param = 'accepted' THEN
        INSERT INTO public.group_members (group_id, athlete_id)
        VALUES (request.group_id, request.athlete_id)
        ON CONFLICT (group_id, athlete_id) DO NOTHING;
    END IF;

    RETURN jsonb_build_object('status', 'success', 'message', 'La demande a été traitée.');
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object('status', 'error', 'message', 'Une erreur est survenue lors du traitement.');
END;
$$;
