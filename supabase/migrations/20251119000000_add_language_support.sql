-- Ajouter la colonne pour la langue préférée
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language TEXT NOT NULL DEFAULT 'fr' 
CHECK (preferred_language IN ('fr', 'en', 'es'));

-- Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_profiles_language ON public.profiles(preferred_language);

-- Politique RLS pour permettre la mise à jour
DROP POLICY IF EXISTS "Users can update their language preference" ON public.profiles;
CREATE POLICY "Users can update their language preference"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Vérification
SELECT id, preferred_language FROM public.profiles LIMIT 5;