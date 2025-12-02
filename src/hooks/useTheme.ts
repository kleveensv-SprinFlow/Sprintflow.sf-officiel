import { useState } from 'react';

type Theme = 'dark';

/**
 * Hook simplifié pour verrouiller le thème en mode 'dark'.
 * L'application est désormais "Dark Mode Only".
 * La structure du hook est conservée pour éviter de casser les imports existants.
 */
export const useTheme = () => {
  // Le state est figé sur 'dark'
  const [theme] = useState<Theme>('dark');

  // La fonction de mise à jour est une no-op (ne fait rien)
  // On garde la signature pour compatibilité
  const setTheme = (_: string) => {
    // Intentionnellement vide : le thème ne peut plus être changé
    // On pourrait logger un warning si nécessaire
    // console.debug("Changement de thème désactivé : SprintFlow est 'Dark Mode Only'");
  };

  return { theme, setTheme };
};
