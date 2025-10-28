// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { VitePWA } from "file:///home/project/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["manifest.json"],
      manifest: {
        name: "Sprintflow - Suivi d'entra\xEEnement",
        short_name: "Sprintflow",
        description: "Application de suivi d'entra\xEEnements pour sprinteurs et athl\xE8tes",
        theme_color: "#7c6df2",
        background_color: "#7c6df2",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/sign/logo/icon-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NThiYWE3MC0xZTJiLTQ4NjgtODE2MS04MGNjNjM1OWE2ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2ljb24tbG9nby5wbmciLCJpYXQiOjE3NjE2NjU1NTcsImV4cCI6NDkxNTI2NTU1N30.X-jaqomwL0dBIxf7oEY-qM_iGGOVYuX30XrXj_QhjiA",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/sign/logo/icon-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NThiYWE3MC0xZTJiLTQ4NjgtODE2MS04MGNjNjM1OWE2ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2ljb24tbG9nby5wbmciLCJpYXQiOjE3NjE2NjU1NTcsImV4cCI6NDkxNTI2NTU1N30.X-jaqomwL0dBIxf7oEY-qM_iGGOVYuX30XrXj_QhjiA",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/sign/logo/icon-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NThiYWE3MC0xZTJiLTQ4NjgtODE2MS04MGNjNjM1OWE2ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2ljb24tbG9nby5wbmciLCJpYXQiOjE3NjE2NjU1NTcsImV4cCI6NDkxNTI2NTU1N30.X-jaqomwL0dBIxf7oEY-qM_iGGOVYuX30XrXj_QhjiA",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "https://kqlzvxfdzandgdkqzggj.supabase.co/storage/v1/object/sign/logo/icon-logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NThiYWE3MC0xZTJiLTQ4NjgtODE2MS04MGNjNjM1OWE2ZDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsb2dvL2ljb24tbG9nby5wbmciLCJpYXQiOjE3NjE2NjU1NTcsImV4cCI6NDkxNTI2NTU1N30.X-jaqomwL0dBIxf7oEY-qM_iGGOVYuX30XrXj_QhjiA",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/kqlzvxfdzandgdkqzggj\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
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
    exclude: ["lucide-react"]
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          charts: ["recharts"],
          utils: ["date-fns", "lucide-react"]
        }
      }
    }
  },
  base: "./",
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ21hbmlmZXN0Lmpzb24nXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6ICdTcHJpbnRmbG93IC0gU3VpdmkgZFxcJ2VudHJhXHUwMEVFbmVtZW50JyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ1NwcmludGZsb3cnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FwcGxpY2F0aW9uIGRlIHN1aXZpIGRcXCdlbnRyYVx1MDBFRW5lbWVudHMgcG91ciBzcHJpbnRldXJzIGV0IGF0aGxcdTAwRTh0ZXMnLFxuICAgICAgICB0aGVtZV9jb2xvcjogJyM3YzZkZjInLFxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnIzdjNmRmMicsXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdC1wcmltYXJ5JyxcbiAgICAgICAgc2NvcGU6ICcvJyxcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiAnaHR0cHM6Ly9rcWx6dnhmZHphbmRnZGtxemdnai5zdXBhYmFzZS5jby9zdG9yYWdlL3YxL29iamVjdC9zaWduL2xvZ28vaWNvbi1sb2dvLnBuZz90b2tlbj1leUpyYVdRaU9pSnpkRzl5WVdkbExYVnliQzF6YVdkdWFXNW5MV3RsZVY4NU5UaGlZV0UzTUMweFpUSmlMVFE0TmpndE9ERTJNUzA0TUdOak5qTTFPV0UyWkRVaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SjFjbXdpT2lKc2IyZHZMMmxqYjI0dGJHOW5ieTV3Ym1jaUxDSnBZWFFpT2pFM05qRTJOalUxTlRjc0ltVjRjQ0k2TkRreE5USTJOVFUxTjMwLlgtamFxb213TDBkQkl4ZjdvRVktcU1faUdHT1ZZdVgzMFhyWGpfUWhqaUEnLFxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogJ2h0dHBzOi8va3FsenZ4ZmR6YW5kZ2RrcXpnZ2ouc3VwYWJhc2UuY28vc3RvcmFnZS92MS9vYmplY3Qvc2lnbi9sb2dvL2ljb24tbG9nby5wbmc/dG9rZW49ZXlKcmFXUWlPaUp6ZEc5eVlXZGxMWFZ5YkMxemFXZHVhVzVuTFd0bGVWODVOVGhpWVdFM01DMHhaVEppTFRRNE5qZ3RPREUyTVMwNE1HTmpOak0xT1dFMlpEVWlMQ0poYkdjaU9pSklVekkxTmlKOS5leUoxY213aU9pSnNiMmR2TDJsamIyNHRiRzluYnk1d2JtY2lMQ0pwWVhRaU9qRTNOakUyTmpVMU5UY3NJbVY0Y0NJNk5Ea3hOVEkyTlRVMU4zMC5YLWphcW9td0wwZEJJeGY3b0VZLXFNX2lHR09WWXVYMzBYclhqX1FoamlBJyxcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnknXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdodHRwczovL2txbHp2eGZkemFuZGdka3F6Z2dqLnN1cGFiYXNlLmNvL3N0b3JhZ2UvdjEvb2JqZWN0L3NpZ24vbG9nby9pY29uLWxvZ28ucG5nP3Rva2VuPWV5SnJhV1FpT2lKemRHOXlZV2RsTFhWeWJDMXphV2R1YVc1bkxXdGxlVjg1TlRoaVlXRTNNQzB4WlRKaUxUUTROamd0T0RFMk1TMDRNR05qTmpNMU9XRTJaRFVpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKMWNtd2lPaUpzYjJkdkwybGpiMjR0Ykc5bmJ5NXdibWNpTENKcFlYUWlPakUzTmpFMk5qVTFOVGNzSW1WNGNDSTZORGt4TlRJMk5UVTFOMzAuWC1qYXFvbXdMMGRCSXhmN29FWS1xTV9pR0dPVll1WDMwWHJYal9RaGppQScsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICdodHRwczovL2txbHp2eGZkemFuZGdka3F6Z2dqLnN1cGFiYXNlLmNvL3N0b3JhZ2UvdjEvb2JqZWN0L3NpZ24vbG9nby9pY29uLWxvZ28ucG5nP3Rva2VuPWV5SnJhV1FpT2lKemRHOXlZV2RsTFhWeWJDMXphV2R1YVc1bkxXdGxlVjg1TlRoaVlXRTNNQzB4WlRKaUxUUTROamd0T0RFMk1TMDRNR05qTmpNMU9XRTJaRFVpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKMWNtd2lPaUpzYjJkdkwybGpiMjR0Ykc5bmJ5NXdibWNpTENKcFlYUWlPakUzTmpFMk5qVTFOVGNzSW1WNGNDSTZORGt4TlRJMk5UVTFOMzAuWC1qYXFvbXdMMGRCSXhmN29FWS1xTV9pR0dPVll1WDMwWHJYal9RaGppQScsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9LFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9rcWx6dnhmZHphbmRnZGtxemdnalxcLnN1cGFiYXNlXFwuY29cXC8uKi9pLFxuICAgICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ3N1cGFiYXNlLWNhY2hlJyxcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDUwLFxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDMwXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KVxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgIGNoYXJ0czogWydyZWNoYXJ0cyddLFxuICAgICAgICAgIHV0aWxzOiBbJ2RhdGUtZm5zJywgJ2x1Y2lkZS1yZWFjdCddXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGJhc2U6ICcuLycsXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG9zdDogdHJ1ZVxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNDE3MyxcbiAgICBob3N0OiB0cnVlXG4gIH1cbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBeU4sU0FBUyxvQkFBb0I7QUFDdFAsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsZUFBZTtBQUFBLE1BQy9CLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxRQUNQLFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxZQUNOLFNBQVM7QUFBQSxVQUNYO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsc0NBQXNDO0FBQUEsUUFDckQsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWTtBQUFBLGdCQUNWLFlBQVk7QUFBQSxnQkFDWixlQUFlLEtBQUssS0FBSyxLQUFLO0FBQUEsY0FDaEM7QUFBQSxjQUNBLG1CQUFtQjtBQUFBLGdCQUNqQixVQUFVLENBQUMsR0FBRyxHQUFHO0FBQUEsY0FDbkI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQzdCLFFBQVEsQ0FBQyxVQUFVO0FBQUEsVUFDbkIsT0FBTyxDQUFDLFlBQVksY0FBYztBQUFBLFFBQ3BDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
