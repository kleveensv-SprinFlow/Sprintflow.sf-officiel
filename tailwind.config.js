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
        'accent': {
          DEFAULT: '#059669', // emerald-600
          light: '#059669',   // emerald-600
          dark: '#34d399',    // emerald-400
        },

        // Thème clair
        'light-background': '#fafafa', // neutral-50
        'light-card': '#ffffff',
        'light-title': '#171717',      // neutral-900
        'light-text': '#525252',       // neutral-600
        'light-label': '#525252',      // neutral-600
        'light-border': '#e5e5e5',     // neutral-200

        // Thème sombre
        'dark-background': '#0a0a0a', // neutral-950
        'dark-card': '#171717',       // neutral-900
        'dark-title': '#f5f5f5',      // neutral-100
        'dark-text': '#a3a3a3',       // neutral-400
        'dark-label': '#a3a3a3',      // neutral-400
        'dark-border': '#262626',     // neutral-800

        // Couleurs pour l'effet Glassmorphism
        'light-glass': 'rgba(255, 255, 255, 0.3)',
        'dark-glass': 'rgba(23, 23, 23, 0.5)',
      },
      boxShadow: {
        'card-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)', // Ombre neutralisée
        'neumorphic-extrude': '3px 3px 6px #b8b9be, -3px -3px 6px #ffffff',
        'neumorphic-press': 'inset 3px 3px 6px #b8b9be, inset -3px -3px 6px #ffffff',
        'neumorphic-extrude-dark': '3px 3px 6px #1a232f, -3px -3px 6px #242f3f',
        'neumorphic-press-dark': 'inset 3px 3px 6px #1a232f, inset -3px -3px 6px #242f3f',
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