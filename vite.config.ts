/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Force le nouveau Service Worker à s'activer immédiatement
        skipWaiting: true,
        clientsClaim: true,
        // Nettoyage automatique des vieux caches
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'SprintFlow',
        short_name: 'SprintFlow',
        description: 'Votre application de suivi pour athlètes.',
        theme_color: '#1F2937',
        background_color: '#1F2937',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'logo.jpg', // Assurez-vous que public/logo.jpg existe
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable',
          },
          {
            src: 'logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react-toastify'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2015',
    cssCodeSplit: true,
    // Augmentation de la limite d'avertissement pour éviter le message jaune
    chunkSizeWarningLimit: 3000, 
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // C'est ici que la magie opère pour diviser le fichier lourd :
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Sépare les grosses librairies spécifiques pour alléger le chargement
            if (id.includes('lottie')) {
              return 'lottie-vendor';
            }
            if (id.includes('supabase')) {
              return 'supabase-vendor';
            }
            // Tout le reste des modules va dans un fichier 'vendor' général
            return 'vendor';
          }
        },
      }
    },
  },
  esbuild: {
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
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/test/setupTests.ts',
  }
});
