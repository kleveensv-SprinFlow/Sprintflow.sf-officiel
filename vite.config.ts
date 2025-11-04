import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Séparation intelligente des chunks
          if (id.includes('node_modules')) {
            // Librairies lourdes dans leurs propres chunks
            if (id.includes('recharts')) return 'charts';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('@mediapipe')) return 'mediapipe';
            if (id.includes('html5-qrcode')) return 'qrcode';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('react') || id.includes('react-dom')) return 'vendor';
            if (id.includes('date-fns')) return 'date-utils';
            if (id.includes('lucide-react')) return 'icons';
            // Autres dépendances dans un chunk commun
            return 'libs';
          }

          // Grouper les composants par fonctionnalité
          if (id.includes('/components/nutrition/')) return 'nutrition';
          if (id.includes('/components/workouts/')) return 'workouts';
          if (id.includes('/components/groups/')) return 'groups';
          if (id.includes('/components/chat/')) return 'chat';
          if (id.includes('/components/video_analysis/')) return 'video-analysis';
        },
        // Optimisation des noms de fichiers pour le cache
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    // Suppression des console.log en production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  base: '/',
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});
