/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Couleurs Sprintflow basées sur le logo
        primary: {
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
        },
        secondary: {
          50: '#fef3c7',
          100: '#fde68a',
          200: '#fcd34d',
          300: '#fbbf24',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
        },
        accent: {
          50: '#fce7f3',
          100: '#fbcfe8',
          200: '#f9a8d4',
          300: '#f472b6',
          400: '#ec4899',
          500: '#db2777',
          600: '#be185d',
          700: '#9f1239',
          800: '#831843',
          900: '#500724',
        }
      },
      fontFamily: {
        'noto-sans': ['"Noto Sans"', 'sans-serif'],
        'din': ['"DIN 1451"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
