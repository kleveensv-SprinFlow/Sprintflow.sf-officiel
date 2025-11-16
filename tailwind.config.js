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
        // --- Thème "Deep Sprint" ---
        'sprint-light-background': '#FAFAFA',
        'sprint-light-surface': '#FFFFFF',
        'sprint-light-text-primary': '#1E1E1E',
        'sprint-light-text-secondary': '#616161',

        'sprint-dark-background': '#121212',
        'sprint-dark-surface': '#1E1E1E',
        'sprint-dark-text-primary': '#F0F0F0',
        'sprint-dark-text-secondary': '#A0A0A0',
        
        'sprint-accent': '#673AB7',

        // Palettes de base conservées pour les éléments comme les boutons
        'primary': '#007AFF',
        'success': '#00C853',
        'orange-accent': '#FF9800',
      },
      boxShadow: {
        'premium-light': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'premium-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
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