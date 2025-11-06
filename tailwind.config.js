/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // Uses the OS setting (light/dark)
  theme: {
    extend: {
      // 1. Brand Colors defined from the brief
      colors: {
        'sprintflow-blue': '#00B8FF',
        
        // Light Mode Palette (inchangée)
        light: {
          background: '#F9F9F9',
          card: '#FFFFFF',
          text: '#333333',
          title: '#111111',
          label: '#666666',
        },
        
        // Dark Mode Palette (MISE À JOUR)
        dark: {
          background: '#0F172A', // Fond bleu nuit très sombre
          card: '#1E293B',       // Cartes plus claires pour le contraste
          text: '#F1F5F9',        // Texte unifié en blanc cassé
          title: '#F1F5F9',       // -- (unifié)
          label: '#F1F5F9',       // -- (unifié)
        },
      },
      
      // 2. Font Family
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      
      // 3. Typographic Scale (Font size and Line height)
      fontSize: {
        'micro': ['12px', '16px'],
        'label': ['14px', '20px'],
        'base': ['16px', '24px'],
        'h3': ['22px', '28px'],
        'h2': ['28px', '36px'],
        'h1': ['36px', '44px'],
      },
      
      // 4. Box Shadows for Cards (MISE À JOUR)
      boxShadow: {
        'card-light': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)', // Ombre douce pour le mode sombre
        'button-glow': '0 0 12px 0 #00B8FF',
      },

      // 5. Animations & Keyframes
      keyframes: {
        'fadeIn-slideUp': {
          'from': { opacity: '0', transform: 'translateY(5px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '80%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-slide-up': 'fadeIn-slideUp 300ms ease-out forwards',
        'pop-in': 'pop-in 200ms ease-out forwards',
      },
    },
  },
  plugins: [],
};