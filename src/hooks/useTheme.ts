import { useState } from 'react';

/**
 * Hook pour gérer le thème de l'application.
 * Version "Dark Mode Radical" : Retourne toujours 'dark'.
 * La logique de changement est désactivée.
 */
export const useTheme = () => {
  // On ne gère plus d'état dynamique, on impose le sombre.
  const theme = 'dark';

  // Fonction factice pour ne pas casser les composants qui l'utilisent
  const setTheme = (newTheme: string) => {
    console.log('Changement de thème désactivé : Mode Sombre imposé.', newTheme);
  };

  return { theme, setTheme };
};
