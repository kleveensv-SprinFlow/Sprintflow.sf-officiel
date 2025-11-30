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

        // Mode clair (deprecated but kept for compatibility during transition)
        'sprint-light-background': '#F3F4F6',
        'sprint-light-surface': '#FFFFFF',
        'sprint-light-surface-subtle': '#F9FAFB',
        'sprint-light-border-subtle': '#E5E7EB',
        'sprint-light-text-primary': '#0F172A',
        'sprint-light-text-secondary': '#4B5563',

        // Mode sombre (GOWOD / Performance Cockpit)
        'sprint-dark-background': '#000000',        // Base for gradients
        'sprint-dark-surface': '#1C1C1E',           // Anthracite fonce
        'sprint-dark-surface-elevated': '#2C2C2E',  // Slightly lighter
        'sprint-dark-border-subtle': 'transparent', // No borders by default

        'sprint-dark-text-primary': '#FFFFFF',      // Pure White
        'sprint-dark-text-secondary': '#9CA3AF',    // Gray-400

        // ——— COMPATIBILITY MAPPING ———
        'light-title': '#111827',
        'light-text': '#374151',
        'light-label': '#4B5563',
        'light-card': '#FFFFFF',

        'dark-title': '#FFFFFF',
        'dark-text': '#E5E7EB',
        'dark-label': '#9CA3AF',
        'dark-card': '#1C1C1E',

        // ——— ACCENT COLORS

        // Primary: Light Electric Blue
        'sprint-primary': '#3B82F6',          // blue-500
        'sprint-primary-hover': '#2563EB',    // blue-600

        // Secondary / Gold (Performance identity)
        'sprint-gold': '#FFC107',

        // Backgrounds for badges/tags
        'sprint-primary-soft': '#EFF6FF',     // blue-50
        'sprint-primary-soft-dark': '#172554', // blue-950
      },
      boxShadow: {
        'premium-light': 'none',
        'premium-dark': 'none', // No shadow in dark mode (flat design)
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
