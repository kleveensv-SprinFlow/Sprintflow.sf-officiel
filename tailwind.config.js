/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'media', // Uses the OS setting (light/dark)
  theme: {
    extend: {
      // 1. Brand Colors defined from the brief
      colors: {
        'sprintflow-blue': '#00B8FF',
        
        // Light Mode Palette
        light: {
          background: '#F9F9F9',
          card: '#FFFFFF',
          text: '#333333',
          title: '#111111',
          label: '#666666',
        },
        
        // Dark Mode Palette
        dark: {
          background: '#121212',
          card: 'rgba(20, 20, 20, 0.8)',
          text: '#E0E0E0',
          title: '#FFFFFF',
          label: '#A0A0A0',
        },
      },
      
      // 2. Font Family
      fontFamily: {
        // Set Manrope as the default sans-serif font
        sans: ['Manrope', 'sans-serif'],
      },
      
      // 3. Typographic Scale (Font size and Line height)
      fontSize: {
        'micro': ['12px', '16px'],
        'label': ['14px', '20px'],
        'base': ['16px', '24px'], // Corresponds to 'Texte normal / Body'
        'h3': ['22px', '28px'],
        'h2': ['28px', '36px'],
        'h1': ['36px', '44px'],
      },
      
      // 4. Box Shadows for Cards
      boxShadow: {
        'card-light': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
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
