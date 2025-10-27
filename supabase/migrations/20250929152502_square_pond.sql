/*
  # Correction des politiques RLS pour la table groups

  1. Problème identifié
    - Les athlètes ne peuvent pas lire la table groups pour rechercher par invitation_code
    - Erreur 406 (Not Acceptable) lors de la requête SELECT

  2. Solution
    - Supprimer les anciennes politiques restrictives
    - Créer une nouvelle politique permettant la lecture par code d'invitation
    - Permettre aux athlètes de lire les groupes pour pouvoir les rejoindre

  3. Sécurité
    - Les athlètes peuvent seulement lire les groupes (pas modifier/supprimer)
    - Les coachs gardent le contrôle total de leurs groupes
    - Le développeur garde l'accès complet
*/

-- Supprimer les anciennes politiques restrictives qui bloquent les athlètes
DROP POLICY IF EXISTS "groups_coach_simple" ON public.groups;
DROP POLICY IF EXISTS "developer_groups_access" ON public.groups;

-- Créer une politique permettant à tous les utilisateurs authentifiés de lire les groupes
-- Ceci est nécessaire pour que les athlètes puissent rechercher un groupe par son code d'invitation
CREATE POLICY "Allow authenticated users to read groups"
  ON public.groups
  FOR SELECT
  TO authenticated
  USING (true);

-- Permettre aux coachs de gérer leurs propres groupes (création, modification, suppression)
CREATE POLICY "Coaches can manage their own groups"
  ON public.groups
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Permettre au développeur d'avoir un accès complet
CREATE POLICY "Developer full access to groups"
  ON public.groups
  FOR ALL
  TO authenticated
  USING (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid)
  WITH CHECK (auth.uid() = '75a17559-b45b-4dd1-883b-ce8ccfe03f0f'::uuid);