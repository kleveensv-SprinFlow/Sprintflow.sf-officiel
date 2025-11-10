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
        // Couleurs principales
        'sprintflow-blue': {
          DEFAULT: '#007AFF', // bleu dynamique (Apple-like)
          light: '#E8F1FF',
          dark: '#0056B3',
        },

        // Accent émotionnels
        'accent-green': '#84CC16',   // progression
        'accent-orange': '#FF9800',  // récompense / énergie
        'accent-red': '#F43F5E',     // alerte / intensité

        // Thème clair optimisé confort visuel
        'light-background': '#F3F4F6', // moins lumineux que #F9FAFB
        'light-card': 'rgba(255, 255, 255, 0.7)', // effet mat
        'light-border': '#E5E7EB',
        'light-title': '#111827',
        'light-text': '#6B7280',

        // Thème sombre premium reposant
        'dark-background': '#0D1117', // fond profond (GitHub dark)
        'dark-card': 'rgba(22, 27, 34, 0.8)', // ton mat équilibré
        'dark-border': '#2D333B',
        'dark-title': '#F3F4F6',
        'dark-text': '#9CA3AF',

        // Gradients et feedback
        'gradient-blue': '#007AFF',
        'gradient-green': '#84CC16',
        'gradient-purple': '#8B5CF6',
      },

      boxShadow: {
        'card-light': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-dark': '0 4px 12px rgba(0, 0, 0, 0.25)',
        'glass': '0 8px 24px rgba(0, 0, 0, 0.1)',
        'focus-glow': '0 0 10px rgba(0, 122, 255, 0.6)',
      },

      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        din: ['"DIN 1451"', 'sans-serif'],
      },

      textShadow: {
        light: '1px 1px 3px rgba(0, 0, 0, 0.1)',
        dark: '1px 1px 3px rgba(0, 0, 0, 0.7)',
      },

      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
      },

      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)', // animation naturelle
      },

      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.02)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
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
        '.animate-pulse-soft': {
          animation: 'pulse-soft 3s ease-in-out infinite',
        },
      })
    }
  ],
}
