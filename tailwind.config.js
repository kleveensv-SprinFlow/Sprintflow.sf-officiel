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
        // Ancienne palette de base, conservée pour le moment pour éviter les erreurs
        'sprintflow-blue': {
          DEFAULT: '#007AFF',
          light: '#EBF5FF',
          dark: '#0056B3',
        },
        'primary': '#007AFF',
        'success': '#00C853',
        'orange-accent': '#FF9800',
        
        // Thème clair
        'light-card': 'rgba(255, 255, 255, 0.65)', // Plus transparent
        'light-title': '#111827',      // gray-900
        'light-text': '#374151',       // gray-700, plus sombre pour le contraste
        'light-border': 'rgba(255, 255, 255, 0.3)', // Bordure en verre
        'accent': '#84CC16',          // lime-500
        
        // Thème sombre
        'dark-card': 'rgba(17, 24, 39, 0.6)', // Plus sombre et plus transparent
        'dark-title': '#F9FAFB',      // gray-50
        'dark-text': '#D1D5DB',       // gray-300, plus clair pour le contraste
        'dark-border': 'rgba(255, 255, 255, 0.1)', // Bordure en verre
        'dark-accent': '#A3E635',     // lime-400
      },
      backdropBlur: {
        'xl': '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'card-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
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
