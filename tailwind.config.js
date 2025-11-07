/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        'sprintflow-blue': '#00B8FF',
        
        light: {
          background: '#F9F9F9',
          card: '#FFFFFF',
          text: '#333333',
          title: '#111111',
          label: '#666666',
        },
        
        // Dark Mode Palette (MISE À JOUR)
        dark: {
          background: '#0F172A', // Fond bleu nuit
          card: '#334155',       // Carte nettement plus claire pour un contraste évident
          text: '#F1F5F9',
          title: '#F1F5F9',
          label: '#F1F5F9',
        },
      },
      
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      
      fontSize: {
        'micro': ['12px', '16px'],
        'label': ['14px', '20px'],
        'base': ['16px', '24px'],
        'h3': ['22px', '28px'],
        'h2': ['28px', '36px'],
        'h1': ['36px', '44px'],
      },
      
      boxShadow: {
        'card-light': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)', // Ombre bien prononcée
        'button-glow': '0 0 12px 0 #00B8FF',
      },

      keyframes: {
        'fadeIn-slideUp': { 'from': { opacity: '0', transform: 'translateY(5px)' }, 'to': { opacity: '1', transform: 'translateY(0)' } },
        'pop-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '80%': { opacity: '1', transform: 'scale(1.02)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in-slide-up': 'fadeIn-slideUp 300ms ease-out forwards',
        'pop-in': 'pop-in 200ms ease-out forwards',
      },
    },
  },
  plugins: [],
}; voici le code actuel propose moi un autre 