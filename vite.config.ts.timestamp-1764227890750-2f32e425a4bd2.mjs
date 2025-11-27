// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import svgr from "file:///home/project/node_modules/vite-plugin-svgr/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    svgr()
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   workbox: {
    //     maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    //   },
    //   manifest: {
    //     name: 'SprintFlow',
    //     short_name: 'SprintFlow',
    //     description: 'Votre application de suivi pour athlètes.',
    //     theme_color: '#1F2937',
    //     background_color: '#1F2937',
    //     display: 'standalone',
    //     scope: '/',
    //     start_url: '/',
    //     orientation: 'portrait',
    //     icons: [
    //       {
    //         src: 'logo.jpg', // Assurez-vous que public/logo.jpg existe
    //         sizes: '512x512',
    //         type: 'image/jpeg',
    //         purpose: 'any maskable',
    //       },
    //       {
    //         src: 'logo.jpg',
    //         sizes: '192x192',
    //         type: 'image/jpeg',
    //       },
    //     ],
    //   },
    // }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: ["react-toastify"]
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    target: "es2015",
    cssCodeSplit: true,
    // Augmentation de la limite d'avertissement pour éviter le message jaune
    chunkSizeWarningLimit: 3e3,
    rollupOptions: {
      output: {
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        // C'est ici que la magie opère pour diviser le fichier lourd :
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lottie")) {
              return "lottie-vendor";
            }
            if (id.includes("supabase")) {
              return "supabase-vendor";
            }
            return "vendor";
          }
        }
      }
    }
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : []
  },
  base: "/",
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
    environment: "jsdom",
    setupFiles: "src/test/setupTests.ts"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcbmltcG9ydCBzdmdyIGZyb20gJ3ZpdGUtcGx1Z2luLXN2Z3InO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBzdmdyKCksXG4gICAgLy8gVml0ZVBXQSh7XG4gICAgLy8gICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAvLyAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnLCAnbWFza2VkLWljb24uc3ZnJ10sXG4gICAgLy8gICB3b3JrYm94OiB7XG4gICAgLy8gICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1ICogMTAyNCAqIDEwMjQsXG4gICAgLy8gICB9LFxuICAgIC8vICAgbWFuaWZlc3Q6IHtcbiAgICAvLyAgICAgbmFtZTogJ1NwcmludEZsb3cnLFxuICAgIC8vICAgICBzaG9ydF9uYW1lOiAnU3ByaW50RmxvdycsXG4gICAgLy8gICAgIGRlc2NyaXB0aW9uOiAnVm90cmUgYXBwbGljYXRpb24gZGUgc3VpdmkgcG91ciBhdGhsXHUwMEU4dGVzLicsXG4gICAgLy8gICAgIHRoZW1lX2NvbG9yOiAnIzFGMjkzNycsXG4gICAgLy8gICAgIGJhY2tncm91bmRfY29sb3I6ICcjMUYyOTM3JyxcbiAgICAvLyAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgIC8vICAgICBzY29wZTogJy8nLFxuICAgIC8vICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAvLyAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdCcsXG4gICAgLy8gICAgIGljb25zOiBbXG4gICAgLy8gICAgICAge1xuICAgIC8vICAgICAgICAgc3JjOiAnbG9nby5qcGcnLCAvLyBBc3N1cmV6LXZvdXMgcXVlIHB1YmxpYy9sb2dvLmpwZyBleGlzdGVcbiAgICAvLyAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXG4gICAgLy8gICAgICAgICB0eXBlOiAnaW1hZ2UvanBlZycsXG4gICAgLy8gICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJyxcbiAgICAvLyAgICAgICB9LFxuICAgIC8vICAgICAgIHtcbiAgICAvLyAgICAgICAgIHNyYzogJ2xvZ28uanBnJyxcbiAgICAvLyAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXG4gICAgLy8gICAgICAgICB0eXBlOiAnaW1hZ2UvanBlZycsXG4gICAgLy8gICAgICAgfSxcbiAgICAvLyAgICAgXSxcbiAgICAvLyAgIH0sXG4gICAgLy8gfSksXG4gIF0sXG4gIG9wdGltaXplRGVwczoge1xuICAgIGV4Y2x1ZGU6IFsnbHVjaWRlLXJlYWN0J10sXG4gICAgaW5jbHVkZTogWydyZWFjdC10b2FzdGlmeSddLFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICAvLyBBdWdtZW50YXRpb24gZGUgbGEgbGltaXRlIGQnYXZlcnRpc3NlbWVudCBwb3VyIFx1MDBFOXZpdGVyIGxlIG1lc3NhZ2UgamF1bmVcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDMwMDAsIFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tleHRdL1tuYW1lXS1baGFzaF0uW2V4dF0nLFxuICAgICAgICAvLyBDJ2VzdCBpY2kgcXVlIGxhIG1hZ2llIG9wXHUwMEU4cmUgcG91ciBkaXZpc2VyIGxlIGZpY2hpZXIgbG91cmQgOlxuICAgICAgICBtYW51YWxDaHVua3MoaWQpIHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICAvLyBTXHUwMEU5cGFyZSBsZXMgZ3Jvc3NlcyBsaWJyYWlyaWVzIHNwXHUwMEU5Y2lmaXF1ZXMgcG91ciBhbGxcdTAwRTlnZXIgbGUgY2hhcmdlbWVudFxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsb3R0aWUnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2xvdHRpZS12ZW5kb3InO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzdXBhYmFzZScpKSB7XG4gICAgICAgICAgICAgIHJldHVybiAnc3VwYWJhc2UtdmVuZG9yJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIFRvdXQgbGUgcmVzdGUgZGVzIG1vZHVsZXMgdmEgZGFucyB1biBmaWNoaWVyICd2ZW5kb3InIGdcdTAwRTluXHUwMEU5cmFsXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcic7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfVxuICAgIH0sXG4gIH0sXG4gIGVzYnVpbGQ6IHtcbiAgICBkcm9wOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nID8gWydjb25zb2xlJywgJ2RlYnVnZ2VyJ10gOiBbXSxcbiAgfSxcbiAgYmFzZTogJy8nLFxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIGhvc3Q6IHRydWVcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IDQxNzMsXG4gICAgaG9zdDogdHJ1ZVxuICB9LFxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICBzZXR1cEZpbGVzOiAnc3JjL3Rlc3Qvc2V0dXBUZXN0cy50cycsXG4gIH1cbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFDQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFdBQVc7QUFFbEIsT0FBTyxVQUFVO0FBRWpCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBZ0NQO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLElBQ3hCLFNBQVMsQ0FBQyxnQkFBZ0I7QUFBQSxFQUM1QjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBO0FBQUEsSUFFZCx1QkFBdUI7QUFBQSxJQUN2QixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQTtBQUFBLFFBRWhCLGFBQWEsSUFBSTtBQUNmLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUUvQixnQkFBSSxHQUFHLFNBQVMsUUFBUSxHQUFHO0FBQ3pCLHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDM0IscUJBQU87QUFBQSxZQUNUO0FBRUEsbUJBQU87QUFBQSxVQUNUO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTSxRQUFRLElBQUksYUFBYSxlQUFlLENBQUMsV0FBVyxVQUFVLElBQUksQ0FBQztBQUFBLEVBQzNFO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxFQUNkO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
