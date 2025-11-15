/*
  # Sécurisation de la Politique UPDATE sur Profiles

  ## Problème de Sécurité Identifié
  La table profiles ne possède pas de politique UPDATE avec WITH CHECK stricte.
  Les utilisateurs peuvent potentiellement modifier des colonnes sensibles comme :
  - role (élévation de privilèges)
  - email (usurpation d'identité)
  - created_at (falsification d'historique)
  - id (corruption de données)

  ## Solution Appliquée
  Création d'une politique UPDATE restrictive qui :
  1. Autorise uniquement la modification de son propre profil (USING)
  2. Bloque explicitement la modification des colonnes immuables (WITH CHECK)

  ## Colonnes Immuables (Protégées)
  - id : Clé primaire, référence auth.users
  - email : Identité, doit être modifié via auth.updateUser()
  - role : Permission critique, seul un admin/trigger peut le définir
  - created_at : Horodatage de création, historique
  - updated_at : Géré automatiquement par la BDD

  ## Colonnes Modifiables (Autorisées)
  - full_name, first_name, last_name
  - photo_url, height, weight, body_fat_percentage
  - date_de_naissance, sexe, discipline, license_number
  - Toutes les autres colonnes de données utilisateur

  ## Impact Sécurité
  - Élimination totale du risque d'élévation de privilèges
  - Protection contre l'usurpation d'identité via modification email
  - Garantie de l'intégrité des métadonnées système
*/

-- =====================================================
-- ÉTAPE 1: SUPPRIMER LES POLICIES UPDATE EXISTANTES
-- =====================================================

-- Supprimer toutes les policies UPDATE pour éviter les conflits
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- =====================================================
-- ÉTAPE 2: CRÉER LA POLICY UPDATE SÉCURISÉE
-- =====================================================

CREATE POLICY "Users can update own profile securely"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Seul l'utilisateur peut modifier son propre profil
    auth.uid() = id
  )
  WITH CHECK (
    -- Vérification stricte: les colonnes immuables ne doivent PAS changer
    auth.uid() = id
    AND id = (SELECT id FROM profiles WHERE id = auth.uid())
    AND email IS NOT DISTINCT FROM (SELECT email FROM profiles WHERE id = auth.uid())
    AND role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid())
    AND created_at IS NOT DISTINCT FROM (SELECT created_at FROM profiles WHERE id = auth.uid())
    -- Note: updated_at n'est pas vérifié car il est géré par un trigger automatique
  );

-- =====================================================
-- ÉTAPE 3: VÉRIFICATION DE LA POLICY CRÉÉE
-- =====================================================

DO $$
DECLARE
  policy_count integer;
  policy_name text;
BEGIN
  -- Compter les policies UPDATE sur profiles
  SELECT COUNT(*), string_agg(policyname, ', ')
  INTO policy_count, policy_name
  FROM pg_policies
  WHERE tablename = 'profiles'
    AND cmd = 'UPDATE'
    AND schemaname = 'public';

  IF policy_count = 1 THEN
    RAISE NOTICE '✅ SUCCESS: 1 policy UPDATE créée sur profiles: %', policy_name;
  ELSIF policy_count = 0 THEN
    RAISE WARNING '⚠️ ATTENTION: Aucune policy UPDATE trouvée sur profiles';
  ELSE
    RAISE WARNING '⚠️ ATTENTION: % policies UPDATE trouvées (attendu: 1)', policy_count;
  END IF;
END $$;

-- =====================================================
-- ÉTAPE 4: COMMENTAIRES DE DOCUMENTATION
-- =====================================================

-- Note: Les commentaires sur les policies ne sont pas supportés dans toutes les versions de PostgreSQL
-- La documentation complète est dans l'en-tête de cette migration
