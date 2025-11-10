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
        'light-background': '#F3F4F6', // gray-100
        'light-card': 'rgba(255, 255, 255, 0.7)',
        'light-title': '#111827',      // gray-900
        'light-text': '#6B7280',       // gray-500
        'light-border': '#E5E7EB',     // gray-200
        'accent': '#84CC16',          // lime-500
        
        // Thème sombre
        'dark-background': '#0D1117',
        'dark-card': 'rgba(22, 27, 34, 0.8)',
        'dark-title': '#F3F4F6',      // gray-100
        'dark-text': '#9CA3AF',       // gray-400
        'dark-border': '#30363d',     // gray-700
        'dark-accent': '#A3E635',     // lime-400
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
