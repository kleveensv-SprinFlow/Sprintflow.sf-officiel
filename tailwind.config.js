/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Activation du mode sombre via une classe sur l'élément HTML
  theme: {
    extend: {
      colors: {
        // Palette de base
        'sprintflow-blue': {
          DEFAULT: '#007AFF',
          light: '#EBF5FF',
          dark: '#0056B3',
        },
        'primary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        // Thème clair
        'light-background': '#F0F2F5', // Un gris très clair, presque blanc
        'light-card': '#FFFFFF',
        'light-title': '#1A202C', // Titres en noir/gris foncé
        'light-text': '#2D3748',  // Texte principal
        'light-label': '#718096', // Labels et textes secondaires

        // Thème sombre
        'dark-background': '#0D1117', // Fond très sombre, bleu nuit
        'dark-card': '#161B22',       // Cartes légèrement plus claires
        'dark-title': '#E6EDF3',      // Titres en blanc cassé
        'dark-text': '#C9D1D9',       // Texte principal
        'dark-label': '#8B949E',      // Labels et textes secondaires
      },
      boxShadow: {
        'card-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        'noto-sans': ['"Noto Sans"', 'sans-serif'],
        din: ['"DIN 1451"', 'sans-serif'],
      },
      textShadow: {
        light: '1px 1px 3px rgba(0, 0, 0, 0.1)',
        dark: '1px 1px 3px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.text-shadow-light': {
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-dark': {
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.7)',
        },
      })
    }
  ],
}