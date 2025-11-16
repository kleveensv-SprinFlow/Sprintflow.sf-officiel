import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

/**
 * Hook pour gérer le changement de thème de l'application.
 * Le thème initial est déjà défini via un script dans main.tsx pour éviter un flash.
 * Ce hook gère uniquement les mises à jour post-chargement.
 */
export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // On lit la valeur initiale depuis localStorage pour synchroniser l'état de React
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  // Fonction pour appliquer le thème
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;
    
    // Détermine si le mode sombre doit être appliqué
    const isDark =
      newTheme === 'dark' ||
      (newTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);
    
    // Sauvegarde le choix
    try {
      localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.warn('Could not save theme to localStorage', error);
    }
    
    setThemeState(newTheme);
  }, []);

  // Écouteur pour les changements de thème du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Si l'utilisateur a choisi 'system' (basé sur l'état React), on ré-applique le thème.
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [applyTheme, theme]); // Dépend de l'état 'theme'

  // La fonction de mise à jour que le composant UI utilisera
  const setTheme = (newTheme: Theme) => {
    applyTheme(newTheme);
  };

  return { theme, setTheme };
};
