import { useState, useEffect } from 'react';

// Définition des types de thèmes possibles
type Theme = 'light' | 'dark' | 'system';

/**
 * Un hook React pour gérer le thème de l'application (clair, sombre, ou préférence système).
 * Il persiste le choix de l'utilisateur dans le localStorage et applique la classe '.dark' à l'élément racine.
 */
export const useTheme = () => {
  // Initialise l'état du thème depuis le localStorage, avec 'system' comme valeur par défaut
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  );

  // Effet qui s'exécute à chaque changement de l'état `theme`
  useEffect(() => {
    const root = window.document.documentElement;

    // Détermine si le mode sombre doit être appliqué
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Ajoute ou retire la classe 'dark' de l'élément <html>
    root.classList.toggle('dark', isDark);

    // Sauvegarde le choix actuel dans le localStorage
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      console.warn('Could not save theme to localStorage', error);
    }
  }, [theme]);

  // Effet pour écouter les changements de thème du système d'exploitation
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Si le thème actuel est 'system', on met à jour notre état pour
      // que l'effet précédent se redéclenche et applique le bon style.
      if (localStorage.getItem('theme') === 'system' || !localStorage.getItem('theme')) {
        setTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    // Nettoie l'écouteur quand le composant est démonté
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return { theme, setTheme };
};