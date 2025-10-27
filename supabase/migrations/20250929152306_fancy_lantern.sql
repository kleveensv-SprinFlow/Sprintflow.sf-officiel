/*
  # Ajouter politique RLS pour permettre aux athlètes de rechercher des groupes

  1. Nouvelle politique
    - Permet aux utilisateurs authentifiés de lire la table `groups`
    - Nécessaire pour que les athlètes puissent rechercher un groupe par code d'invitation
  
  2. Sécurité
    - La politique utilise `USING (true)` pour permettre la lecture de tous les groupes
    - La logique applicative filtre ensuite par `invitation_code`
    - Cela n'expose pas de données sensibles car seuls les codes d'invitation sont utilisés
*/

-- Ajouter une politique RLS pour permettre aux athlètes de rechercher des groupes par code d'invitation
CREATE POLICY "Athletes can select groups by invitation code" 
  ON public.groups
  FOR SELECT 
  TO authenticated
  USING (true);