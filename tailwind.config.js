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
        // ——— NEUTRES / BACKGROUNDS

        // Mode clair
        'sprint-light-background': '#F3F4F6',       // fond global
        'sprint-light-surface': '#FFFFFF',          // cartes
        'sprint-light-surface-subtle': '#F9FAFB',   // petites surfaces / headers
        'sprint-light-border-subtle': '#E5E7EB',

        'sprint-light-text-primary': '#0F172A',
        'sprint-light-text-secondary': '#6B7280',

        // Mode sombre
        'sprint-dark-background': '#020617',        // fond global
        'sprint-dark-surface': '#0B1120',           // cartes
        'sprint-dark-surface-elevated': '#111827',  // cartes importantes / modales
        'sprint-dark-border-subtle': '#1F2937',

        'sprint-dark-text-primary': '#E5E7EB',
        'sprint-dark-text-secondary': '#9CA3AF',

        // ——— INDIGO / COULEUR DE MARQUE

        // action principale (boutons, icônes actives)
        'sprint-primary': '#4F46E5',          // indigo-600
        'sprint-primary-hover': '#4338CA',    // indigo-700

        // fond léger clair (badges, pills, tags)
        'sprint-primary-soft': '#EEF2FF',     // indigo-50

        // fond léger sombre (badges, pills, tags en dark)
        'sprint-primary-soft-dark': '#1E1B4B', // indigo/violet très sombre

        // Anciennes couleurs utiles
        'sprint-accent': '#673AB7',           // secondaire (à utiliser rarement)
        'primary': '#007AFF',
        'success': '#00C853',
        'orange-accent': '#FF9800',
      },
      boxShadow: {
        'premium-light':
          '0 12px 30px -18px rgba(15, 23, 42, 0.35)',
        'premium-dark':
          '0 18px 40px -24px rgba(0, 0, 0, 0.9)',
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
