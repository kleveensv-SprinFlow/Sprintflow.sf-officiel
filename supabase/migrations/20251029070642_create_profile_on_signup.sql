-- 1. Créer une fonction qui sera appelée par le trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer une nouvelle ligne dans la table 'profiles'
  -- L'ID de l'utilisateur est récupéré depuis la nouvelle ligne dans 'auth.users'
  -- Les métadonnées (prénom, nom, rôle) sont extraites de 'raw_user_meta_data'
  INSERT INTO public.profiles (id, first_name, last_name, role, role_specifique, created_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'role',
    new.raw_user_meta_data->>'role_specifique',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer un trigger qui s'exécute après chaque nouvelle inscription
-- Le trigger appelle la fonction 'handle_new_user'
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
