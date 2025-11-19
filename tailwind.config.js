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
        // ————— MODE CLAIR
        'sprint-light-background': '#F3F4F6',       // gris très clair (fond global)
        'sprint-light-surface': '#FFFFFF',          // cartes principales
        'sprint-light-surface-subtle': '#F9FAFB',   // petites surfaces / headers
        'sprint-light-border-subtle': '#E5E7EB',    // bordures légères

        'sprint-light-text-primary': '#0F172A',
        'sprint-light-text-secondary': '#6B7280',

        // ————— MODE SOMBRE
        'sprint-dark-background': '#020617',        // presque noir bleuté (fond global)
        'sprint-dark-surface': '#0B1120',           // cartes
        'sprint-dark-surface-elevated': '#111827',  // cartes très importantes / modales
        'sprint-dark-border-subtle': '#1F2937',     // bordures discrètes

        'sprint-dark-text-primary': '#E5E7EB',
        'sprint-dark-text-secondary': '#9CA3AF',

        // Accent inchangés
        'sprint-accent': '#673AB7',
        'primary': '#007AFF',
        'success': '#00C853',
        'orange-accent': '#FF9800',
      },
      boxShadow: {
        'premium-light':
          '0 10px 30px -20px rgba(15, 23, 42, 0.3)', // ombre un peu plus marquée
        'premium-dark':
          '0 18px 35px -24px rgba(0, 0, 0, 0.9)',
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
