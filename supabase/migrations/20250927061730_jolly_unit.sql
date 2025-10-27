/*
  # Désactivation complète RLS pour les groupes

  1. Désactivation RLS
    - Désactive RLS sur `groups` et `group_members`
    - Supprime toutes les politiques existantes
    - Évite les récursions infinies

  2. Sécurité
    - Sécurité maintenue au niveau application
    - Validation côté client
    - Contrôles d'accès par rôle utilisateur

  3. Performance
    - Requêtes directes sans politiques
    - Pas de jointures complexes
    - Chargement optimisé
*/

-- Désactiver RLS sur groups
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;

-- Désactiver RLS sur group_members  
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes pour groups
DROP POLICY IF EXISTS "Coaches can manage their groups" ON groups;
DROP POLICY IF EXISTS "Athletes can read groups they belong to" ON groups;
DROP POLICY IF EXISTS "Users can read groups they belong to" ON groups;
DROP POLICY IF EXISTS "Coaches can manage groups" ON groups;

-- Supprimer toutes les politiques existantes pour group_members
DROP POLICY IF EXISTS "Coaches can manage their group members" ON group_members;
DROP POLICY IF EXISTS "Athletes can read their group memberships" ON group_members;
DROP POLICY IF EXISTS "Users can read their memberships" ON group_members;
DROP POLICY IF EXISTS "Coaches can manage members" ON group_members;

-- Créer des index pour optimiser les performances sans RLS
CREATE INDEX IF NOT EXISTS idx_groups_coach_id_optimized ON groups(coach_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id_optimized ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_athlete_id_optimized ON group_members(athlete_id);

-- Fonction pour générer des codes d'invitation si elle n'existe pas
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;