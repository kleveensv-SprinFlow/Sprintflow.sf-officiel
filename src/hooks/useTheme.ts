import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('system');

  useEffect(() => {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme') as Theme | null;

    if (storedTheme) {
      setThemeState(storedTheme);
    }

    const applyTheme = (themeToApply: Theme) => {
      if (themeToApply === 'dark' || (themeToApply === 'system' && isDarkMode)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(storedTheme || 'system');

  }, []);

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (newTheme === 'dark' || (newTheme === 'system' && isDarkMode)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return { theme, setTheme };
};
