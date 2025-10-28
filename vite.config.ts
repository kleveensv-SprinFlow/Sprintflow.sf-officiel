import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['manifest.json'],
      manifest: {
        name: 'Sprintflow - Suivi d\'entraînement',
        short_name: 'Sprintflow',
        description: 'Application de suivi d\'entraînements pour sprinteurs et athlètes',
        theme_color: '#7c6df2',
        background_color: '#7c6df2',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/sign/logo/icon-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NThiYWE3MC0xZTJiLTQ4NjgtODE2MS04MGNjNjM1OWE2ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2ljb24tbG9nby5wbmciLCJpYXQiOjE3NjE2NjU1NTcsImV4cCI6NDkxNTI2NTU1N30.X-jaqomwL0dBIxf7oEY-qM_iGGOVYuX30XrXj_QhjiA',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/sign/logo/icon-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NThiYWE3MC0xZTJiLTQ4NjgtODE2MS04MGNjNjM1OWE2ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2ljb24tbG9nby5wbmciLCJpYXQiOjE3NjE2NjU1NTcsImV4cCI6NDkxNTI2NTU1N30.X-jaqomwL0dBIxf7oEY-qM_iGGOVYuX30XrXj_QhjiA',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/sign/logo/icon-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NThiYWE3MC0xZTJiLTQ4NjgtODE2MS04MGNjNjM1OWE2ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2ljb24tbG9nby5wbmciLCJpYXQiOjE3NjE2NjU1NTcsImV4cCI6NDkxNTI2NTU1N30.X-jaqomwL0dBIxf7oEY-qM_iGGOVYuX30XrXj_QhjiA',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/sign/logo/icon-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NThiYWE3MC0xZTJiLTQ4NjgtODE2MS04MGNjNjM1OWE2ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2ljb24tbG9nby5wbmciLCJpYXQiOjE3NjE2NjU1NTcsImV4cCI6NDkxNTI2NTU1N30.X-jaqomwL0dBIxf7oEY-qM_iGGOVYuX30XrXj_QhjiA',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/kqlzvxfdzandgdkqzggj\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          utils: ['date-fns', 'lucide-react']
        }
      }
    }
  },
  base: './',
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});