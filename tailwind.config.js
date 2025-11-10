/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // --- NOUVELLE PALETTE SÉMANTIQUE (OPTION 2) ---
      colors: {
        
        // 1. FOND (Le "canvas" de l'application)
        // Utilisation: <body class="bg-background ...">
        background: {
          DEFAULT: '#F9FAFB', // gray-50 (Blanc cassé)
          dark: '#111827',    // gray-900 (Anthracite)
        },
        
        // 2. CARTES (Utilisé par le plugin ".glass-effect")
        // Ce ne sont que les couleurs de base pour le verre
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.8)', // bg-white/80
          dark: 'rgba(31, 41, 55, 0.7)',    // bg-gray-800/70
        },

        // 3. BORDURES (Utilisé par le plugin ".glass-effect")
        // Ce sont les bordures qui définissent le "verre"
        'card-border': {
          DEFAULT: '#E5E7EB', // gray-200
          dark: '#374151',    // gray-700
        },

        // 4. ACCENT (Lime/Volt)
        // Utilisation: Boutons, Liens, Icônes actives
        // Classes: bg-accent, text-accent-dark
        accent: {
          DEFAULT: '#84CC16', // lime-500 (Pour Mode Clair)
          dark: '#A3E635',     // lime-400 (Pour Mode Sombre)
          // Texte sur les boutons (pour un bon contraste)
          foreground: '#111827', // gray-900
        },

        // 5. TEXTE
        // Utilisation: text-foreground, text-foreground-secondary
        foreground: {
          DEFAULT: '#111827',    // gray-900 (Titres clairs)
          secondary: '#6B7280', // gray-500 (Texte clair)
          
          dark: '#F3F4F6',      // gray-100 (Titres sombres)
          'dark-secondary': '#9CA3AF', // gray-400 (Texte sombre)
        },
      },
      
      // Ombres naturelles pour les cartes
      boxShadow: {
        'glass-light': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'glass-dark': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      },
      
      // Police "premium" unique
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },

      // Vous pouvez garder vos animations/textShadow ici si vous le souhaitez
      textShadow: {
        light: '1px 1px 3px rgba(0, 0, 0, 0.1)',
        dark: '1px 1px 3px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    
    // --- NOUVEAU PLUGIN POUR L'EFFET "GLASSMORPHISM" ---
    // Il crée la classe ".glass-effect"
    plugin(function({ addUtilities, theme }) {
      addUtilities({
        '.glass-effect': {
          // --- Styles Mode Clair ---
          'backgroundColor': theme('colors.card.DEFAULT'),
          'backdropFilter': 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          'border': `1px solid ${theme('colors.card-border.DEFAULT')}`,
          'boxShadow': theme('boxShadow.glass-light'),
          
          // --- Styles Mode Sombre (gérés automatiquement) ---
          '.dark &': {
            'backgroundColor': theme('colors.card.dark'),
            'border': `1px solid ${theme('colors.card-border.dark')}`,
            'boxShadow': theme('boxShadow.glass-dark'),
          }
        }
      })
    })
  ],
}