// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ——— NEUTRES / BACKGROUNDS (Mode Sombre Uniquement)
        'sprint-dark-background': '#020617',        // fond global
        'sprint-dark-surface': '#0B1120',           // cartes
        'sprint-dark-surface-elevated': '#111827',  // cartes importantes / modales
        'sprint-dark-border-subtle': '#1F2937',

        'sprint-dark-text-primary': '#E5E7EB',
        'sprint-dark-text-secondary': '#9CA3AF',
        
        // ——— INDIGO / COULEUR DE MARQUE
        'sprint-primary': '#4F46E5',          // indigo-600
        'sprint-primary-hover': '#4338CA',    // indigo-700
        'sprint-primary-soft-dark': '#1E1B4B', // badges, pills, etc.

        // ——— COULEURS SÉMANTIQUES (pour compatibilité)
        'dark-title': '#F9FAFB',
        'dark-text': '#E5E7EB',
        'dark-label': '#D1D5DB',
        'dark-card': '#111827',
      },
      boxShadow: {
        'premium-dark': '0 18px 40px -24px rgba(0, 0, 0, 0.9)',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        'noto-sans': ['"Noto Sans"', 'sans-serif'],
        din: ['"DIN 1451"', 'sans-serif'],
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 0.9 },
          '50%': { opacity: 1 },
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
