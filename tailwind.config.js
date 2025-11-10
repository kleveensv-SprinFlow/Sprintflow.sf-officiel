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
          light: '#059669',
          dark: '#34d399',
        },

        // Thème clair premium (gris doux + émeraude)
        'light-background': '#f3f4f6',
        'light-card': '#f9fafb',
        'light-title': '#171717',
        'light-text': '#525252',
        'light-label': '#6b7280',
        'light-border': '#e5e5e5',

        // Thème sombre premium
        'dark-background': '#0a0a0a',
        'dark-card': '#171717',
        'dark-title': '#f5f5f5',
        'dark-text': '#a3a3a3',
        'dark-label': '#a3a3a3',
        'dark-border': '#262626',

        // Variante "Lavande froide premium"
        'lavender-background': '#eef2ff',  // indigo-50
        'lavender-card': '#f8fafc',        // slate-50
        'lavender-title': '#312e81',       // indigo-900
        'lavender-text': '#4f46e5',        // indigo-600
        'lavender-label': '#6366f1',       // indigo-500
        'lavender-accent': '#a78bfa',      // violet-400
        'lavender-border': '#e0e7ff',      // indigo-100

        // Glassmorphism
        'light-glass': 'rgba(255, 255, 255, 0.3)',
        'dark-glass': 'rgba(23, 23, 23, 0.5)',
      },
      boxShadow: {
        'card-light': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'card-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
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
