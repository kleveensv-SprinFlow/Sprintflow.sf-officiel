// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild",
    target: "es2015",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("recharts")) return "charts";
            if (id.includes("framer-motion")) return "motion";
            if (id.includes("@mediapipe")) return "mediapipe";
            if (id.includes("html5-qrcode")) return "qrcode";
            if (id.includes("@supabase")) return "supabase";
            if (id.includes("react") || id.includes("react-dom")) return "vendor";
            if (id.includes("date-fns")) return "date-utils";
            if (id.includes("lucide-react")) return "icons";
            return "libs";
          }
          if (id.includes("/components/nutrition/")) return "nutrition";
          if (id.includes("/components/workouts/")) return "workouts";
          if (id.includes("/components/groups/")) return "groups";
          if (id.includes("/components/chat/")) return "chat";
          if (id.includes("/components/video_analysis/")) return "video-analysis";
        },
        // Optimisation des noms de fichiers pour le cache
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
      }
    },
    chunkSizeWarningLimit: 1e3
  },
  esbuild: {
    // Suppression des console.log en production
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
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcbiAgICAgICAgICAvLyBTXHUwMEU5cGFyYXRpb24gaW50ZWxsaWdlbnRlIGRlcyBjaHVua3NcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ25vZGVfbW9kdWxlcycpKSB7XG4gICAgICAgICAgICAvLyBMaWJyYWlyaWVzIGxvdXJkZXMgZGFucyBsZXVycyBwcm9wcmVzIGNodW5rc1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWNoYXJ0cycpKSByZXR1cm4gJ2NoYXJ0cyc7XG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2ZyYW1lci1tb3Rpb24nKSkgcmV0dXJuICdtb3Rpb24nO1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAbWVkaWFwaXBlJykpIHJldHVybiAnbWVkaWFwaXBlJztcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnaHRtbDUtcXJjb2RlJykpIHJldHVybiAncXJjb2RlJztcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHN1cGFiYXNlJykpIHJldHVybiAnc3VwYWJhc2UnO1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdCcpIHx8IGlkLmluY2x1ZGVzKCdyZWFjdC1kb20nKSkgcmV0dXJuICd2ZW5kb3InO1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdkYXRlLWZucycpKSByZXR1cm4gJ2RhdGUtdXRpbHMnO1xuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdsdWNpZGUtcmVhY3QnKSkgcmV0dXJuICdpY29ucyc7XG4gICAgICAgICAgICAvLyBBdXRyZXMgZFx1MDBFOXBlbmRhbmNlcyBkYW5zIHVuIGNodW5rIGNvbW11blxuICAgICAgICAgICAgcmV0dXJuICdsaWJzJztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBHcm91cGVyIGxlcyBjb21wb3NhbnRzIHBhciBmb25jdGlvbm5hbGl0XHUwMEU5XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvY29tcG9uZW50cy9udXRyaXRpb24vJykpIHJldHVybiAnbnV0cml0aW9uJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9jb21wb25lbnRzL3dvcmtvdXRzLycpKSByZXR1cm4gJ3dvcmtvdXRzJztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9jb21wb25lbnRzL2dyb3Vwcy8nKSkgcmV0dXJuICdncm91cHMnO1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL2NvbXBvbmVudHMvY2hhdC8nKSkgcmV0dXJuICdjaGF0JztcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9jb21wb25lbnRzL3ZpZGVvX2FuYWx5c2lzLycpKSByZXR1cm4gJ3ZpZGVvLWFuYWx5c2lzJztcbiAgICAgICAgfSxcbiAgICAgICAgLy8gT3B0aW1pc2F0aW9uIGRlcyBub21zIGRlIGZpY2hpZXJzIHBvdXIgbGUgY2FjaGVcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ2Fzc2V0cy9bZXh0XS9bbmFtZV0tW2hhc2hdLltleHRdJyxcbiAgICAgIH1cbiAgICB9LFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgfSxcbiAgZXNidWlsZDoge1xuICAgIC8vIFN1cHByZXNzaW9uIGRlcyBjb25zb2xlLmxvZyBlbiBwcm9kdWN0aW9uXG4gICAgZHJvcDogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/IFsnY29uc29sZScsICdkZWJ1Z2dlciddIDogW10sXG4gIH0sXG4gIGJhc2U6ICcvJyxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBob3N0OiB0cnVlXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA0MTczLFxuICAgIGhvc3Q6IHRydWVcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUVsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxFQUMxQjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsV0FBVztBQUFBLElBQ1gsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLElBQ2QsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYyxDQUFDLE9BQU87QUFFcEIsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBRS9CLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEVBQUcsUUFBTztBQUNwQyxnQkFBSSxHQUFHLFNBQVMsZUFBZSxFQUFHLFFBQU87QUFDekMsZ0JBQUksR0FBRyxTQUFTLFlBQVksRUFBRyxRQUFPO0FBQ3RDLGdCQUFJLEdBQUcsU0FBUyxjQUFjLEVBQUcsUUFBTztBQUN4QyxnQkFBSSxHQUFHLFNBQVMsV0FBVyxFQUFHLFFBQU87QUFDckMsZ0JBQUksR0FBRyxTQUFTLE9BQU8sS0FBSyxHQUFHLFNBQVMsV0FBVyxFQUFHLFFBQU87QUFDN0QsZ0JBQUksR0FBRyxTQUFTLFVBQVUsRUFBRyxRQUFPO0FBQ3BDLGdCQUFJLEdBQUcsU0FBUyxjQUFjLEVBQUcsUUFBTztBQUV4QyxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyx3QkFBd0IsRUFBRyxRQUFPO0FBQ2xELGNBQUksR0FBRyxTQUFTLHVCQUF1QixFQUFHLFFBQU87QUFDakQsY0FBSSxHQUFHLFNBQVMscUJBQXFCLEVBQUcsUUFBTztBQUMvQyxjQUFJLEdBQUcsU0FBUyxtQkFBbUIsRUFBRyxRQUFPO0FBQzdDLGNBQUksR0FBRyxTQUFTLDZCQUE2QixFQUFHLFFBQU87QUFBQSxRQUN6RDtBQUFBO0FBQUEsUUFFQSxnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLHVCQUF1QjtBQUFBLEVBQ3pCO0FBQUEsRUFDQSxTQUFTO0FBQUE7QUFBQSxJQUVQLE1BQU0sUUFBUSxJQUFJLGFBQWEsZUFBZSxDQUFDLFdBQVcsVUFBVSxJQUFJLENBQUM7QUFBQSxFQUMzRTtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
