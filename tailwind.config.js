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
        // Ancienne palette de base
        'sprintflow-blue': {
          DEFAULT: '#007AFF',
          light: '#EBF5FF',
          dark: '#0056B3',
        },
        'primary': '#007AFF',
        'success': '#00C853',
        'orange-accent': '#FF9800',
        
        // --- Thème clair (inchangé pour le moment) ---
        'light-background': '#F3F4F6',
        'light-card': 'rgba(255, 255, 255, 0.7)',
        'light-title': '#111827',
        'light-text': '#6B7280',
        'light-border': '#E5E7EB',
        'accent': '#84CC16',
        
        // --- NOUVEAU Thème sombre ---
        'dark-background': '#1F2937', // Gris foncé et doux
        'dark-card': '#374151',       // Gris un peu plus clair
        'dark-title': '#F9FAFB',      // Titre clair pour contraste
        'dark-text': '#D1D5DB',       // Texte clair pour contraste
        'dark-border': '#4B5563',     // Bordure subtile
        'dark-accent': '#A3E635',
      },
      boxShadow: {
        // Anciennes ombres
        'card-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        
        // --- NOUVELLE Ombre pour le thème sombre ---
        'neumorphic-dark': '5px 5px 10px #1a232e, -5px -5px 10px #243548',
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
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 0.9 },
          '50%': { opacity: 1 },
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}