-- 1. Créer une fonction qui sera appelée par le trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_avatar_path TEXT;
BEGIN
  -- Insérer une nouvelle ligne dans la table 'profiles' avec les métadonnées de base
  INSERT INTO public.profiles (id, first_name, last_name, role, role_specifique, date_de_naissance, avatar_url, created_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'role_specifique',
    (new.raw_user_meta_data->>'date_de_naissance')::date,
    new.raw_user_meta_data->>'avatar_url',
    now()
  );

  -- Gérer le renommage de l'avatar si un chemin temporaire existe
  IF new.raw_user_meta_data->>'temp_avatar_path' IS NOT NULL THEN
    -- Construire le nouveau chemin avec l'ID utilisateur final
    new_avatar_path := 'avatars/' || new.id::text || '.' || split_part(new.raw_user_meta_data->>'temp_avatar_path', '.', 2);
    
    -- Déplacer/renommer l'objet dans le bucket de stockage
    PERFORM supabase.storage.move(
      from_bucket := 'profiles',
      from_path := new.raw_user_meta_data->>'temp_avatar_path',
      to_path := new_avatar_path
    );
    
    -- Mettre à jour l'URL de l'avatar dans la table profiles
    UPDATE public.profiles
    SET avatar_url = supabase.storage.get_public_url('profiles', new_avatar_path)
    WHERE id = new.id;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer un trigger qui s'exécute après chaque nouvelle inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Supprimer l'ancien trigger pour éviter les doublons
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();