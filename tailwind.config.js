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
        'light-background': '#F9FAFB', // gray-50
        'light-card': 'rgba(255, 255, 255, 0.8)',
        'light-border': '#E5E7EB', // gray-200
        'light-title': '#111827',      // gray-900
        'light-text': '#6B7280',       // gray-500
        'accent': '#84CC16',          // lime-500
        
        // Thème sombre
        'dark-background': '#111827', // gray-900
        'dark-card': 'rgba(31, 41, 55, 0.7)', // gray-800 with 70% opacity
        'dark-border': '#374151',     // gray-700
        'dark-title': '#F3F4F6',      // gray-100
        'dark-text': '#9CA3AF',       // gray-400
        'dark-accent': '#A3E635',     // lime-400
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
