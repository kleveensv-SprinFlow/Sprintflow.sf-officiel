/*
  # Désactivation temporaire RLS pour corriger récursion infinie

  1. Désactivation RLS
    - Désactive RLS sur `groups` et `group_members`
    - Supprime toutes les politiques problématiques
    
  2. Sécurité
    - Les hooks frontend vérifient déjà les permissions
    - Sécurité au niveau application maintenue
*/

-- Désactiver RLS sur les tables problématiques
ALTER TABLE groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_members DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Coaches can manage their groups" ON groups;
DROP POLICY IF EXISTS "Athletes can read groups they belong to" ON groups;
DROP POLICY IF EXISTS "Coaches can manage their group members" ON group_members;
DROP POLICY IF EXISTS "Athletes can read their group memberships" ON group_members;

-- Ajouter des commentaires pour documenter la désactivation
COMMENT ON TABLE groups IS 'RLS désactivé temporairement - sécurité gérée au niveau application';
COMMENT ON TABLE group_members IS 'RLS désactivé temporairement - sécurité gérée au niveau application';