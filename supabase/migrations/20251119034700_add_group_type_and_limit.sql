DO $$
BEGIN
    -- Ajouter la colonne 'type' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'groups' AND column_name = 'type' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.groups ADD COLUMN type TEXT NOT NULL DEFAULT 'groupe';
        COMMENT ON COLUMN public.groups.type IS 'Définit si le groupe est pour plusieurs athlètes (groupe) ou un seul (athlete).';
    END IF;

    -- Ajouter la colonne 'max_members' si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'groups' AND column_name = 'max_members' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.groups ADD COLUMN max_members INTEGER;
        COMMENT ON COLUMN public.groups.max_members IS 'Le nombre maximum de membres autorisés dans le groupe.';
    END IF;

    -- Ajouter la contrainte de vérification si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'group_type_check' AND conrelid = 'public.groups'::regclass
    ) THEN
        ALTER TABLE public.groups ADD CONSTRAINT group_type_check CHECK (type IN ('groupe', 'athlete'));
    END IF;
END;
$$;
