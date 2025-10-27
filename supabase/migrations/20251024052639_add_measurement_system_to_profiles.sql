/*
  # Ajout du système de mesure dans les profils

  ## Modification
  
  Ajoute un champ `systeme_mesure` à la table `profiles` pour stocker la méthode de mesure de composition corporelle choisie par l'utilisateur.
  
  ## Détails
  
  - **Nouveau champ** : `systeme_mesure` (type text, nullable)
  - **Valeurs possibles** :
    - 'balance_impedancemetre' : Balance avec impédancemètre
    - 'pince_cutanee' : Pince à plis cutanés
    - 'dexa' : DEXA Scan
    - 'bodpod' : Bod Pod
    - 'hydrodensitometrie' : Pesée hydrostatique
    - 'autre' : Autre méthode (avec possibilité de spécifier)
  - **Par défaut** : NULL (l'utilisateur doit le configurer au premier usage)
  
  ## Notes
  
  - L'utilisateur configure son système de mesure une seule fois
  - Il peut le modifier ultérieurement si besoin
  - Cette configuration est utilisée pour afficher des informations pertinentes selon la méthode
*/

-- Ajout du champ systeme_mesure dans la table profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS systeme_mesure TEXT;

-- Commentaire sur la colonne
COMMENT ON COLUMN profiles.systeme_mesure IS 'Système de mesure de composition corporelle choisi par l''utilisateur';
