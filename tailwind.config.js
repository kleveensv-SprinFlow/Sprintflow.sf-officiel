/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- NOUVEAU Thème clair ---
        'light-background': '#F9FAFB', // Fond gris très clair
        'light-card': '#FFFFFF',       // Cartes blanches
        'light-title': '#111827',
        'light-text': '#374151',
        'light-border': '#E5E7EB',
        'accent': '#84CC16',
        
        // --- NOUVEAU Thème sombre ---
        'dark-background': '#111827', // Fond anthracite très profond
        'dark-card': '#374151',       // Cartes gris nettement plus clair
        'dark-title': '#F9FAFB',
        'dark-text': '#D1D5DB',
        'dark-border': '#4B5563',
        'dark-accent': '#A3E635',

        // Palettes de base conservées pour les éléments comme les boutons
        'primary': '#007AFF',
        'success': '#00C853',
        'orange-accent': '#FF9800',
      },
      boxShadow: {
        // --- NOUVELLE Ombre unifiée pour les cartes ---
        'card-default': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        'noto-sans': ['"Noto Sans"', 'sans-serif'],
        din: ['"DIN 1451"', 'sans-serif'],
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}