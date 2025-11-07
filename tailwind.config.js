/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  
  // 'class' vous donne le contrôle (premium) vs 'media' (automatique)
  darkMode: 'class', 
  
  theme: {
    extend: {
      colors: {
        // --- 1. NOUVELLE PALETTE PRIMAIRE ---
        // Un bleu "premium" plus profond, moins saturé (psychologiquement plus confiant)
        primary: {
          light: '#3B82F6', // blue-500 (pour hover)
          DEFAULT: '#2563EB', // blue-600 (votre nouveau "sprintflow-blue")
          dark: '#1D4ED8',  // blue-700 (pour active/pressed)
        },

        // --- 2. COULEURS SÉMANTIQUES (POUR LES SLIDERS) ---
        // Essentiel pour un feedback visuel instantané (Bon/Mauvais)
        success: '#10B981', // green-500
        warning: '#F59E0B', // amber-500
        danger: '#EF4444',  // red-500

        // --- 3. PALETTE "LIGHT MODE" (RAFFINÉE) ---
        light: {
          background: '#F8FAFC', // slate-50 (Plus "Apple" que F9F9F9)
          card: '#FFFFFF',
          'text-primary': '#1E293B',   // slate-800 (Titres)
          'text-secondary': '#475569', // slate-600 (Corps de texte)
          'text-tertiary': '#94A3B8',  // slate-400 (Labels/Inactifs)
        },

        // --- 4. PALETTE "DARK MODE" (HIÉRARCHIE CORRIGÉE) ---
        dark: {
          background: '#0F172A', // slate-900 (Parfait, on garde)
          
          // A. Pour les cartes OPAQUES (ex: modales)
          'card-opaque': '#1E293B', // slate-800
          
          // B. Pour le GLASSMORPHISM (vos cartes principales)
          'card-glass': 'rgba(30, 41, 59, 0.7)', // slate-800 à 70%
          'card-glass-border': 'rgba(241, 245, 249, 0.1)', // slate-100 à 10%

          // HIÉRARCHIE DE TEXTE (LE PLUS IMPORTANT)
          'text-primary': '#F1F5F9',   // slate-100 (Titres - Lumineux)
          'text-secondary': '#CBD5E1', // slate-300 (Corps - Moins lumineux)
          'text-tertiary': '#64748B',  // slate-500 (Labels - Discret)
        },
      },

      // --- 5. POLICE "APPLE FRIENDLY" ---
      fontFamily: {
        // Inter est la police reine des UI modernes. C'est le choix "premium" et "fluide".
        sans: ['Inter', 'sans-serif'],
      },
      
      fontSize: {
        // Votre structure est bonne, je la garde.
         'micro': ['12px', '16px'],
         'label': ['14px', '20px'],
         'base': ['16px', '24px'],
         'h3': ['22px', '28px'],
         'h2': ['28px', '36px'],
         'h1': ['36px', '44px'],
      },

      // --- 6. OMBRES "PREMIUM" ---
      boxShadow: {
        'card-light': '0 10px 25px -5px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)', // Plus subtil
        'card-dark': '0 20px 25px -5px rgba(0, 0, 0, 0.3)', // Ombre noire moins "lourde"
        
        // Glow mis à jour avec la nouvelle couleur primaire
        'button-glow': '0 0 12px 0 #2563EB', 
      },

      // --- 7. NOUVELLES ANIMATIONS ---
      keyframes: {
        'fadeIn-slideUp': { from: