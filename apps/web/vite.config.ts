import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import compression from "vite-plugin-compression";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [
    tailwindcss(),
    tanstackRouter({}),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png", "icons/*.svg", "offline.html"],
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240,
      deleteOriginFile: false,
    }),
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 10240,
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
  },
  build: {
    target: "es2020",
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tanstack-vendor': ['@tanstack/react-router', '@tanstack/react-virtual'],
          'ui-vendor': ['@base-ui/react'],
          'utils': ['clsx', 'class-variance-authority', 'tailwind-merge'],
          'form-vendor': ['@tanstack/react-form', '@hookform/resolvers'],
          'validation': ['zod'],
          'theme': ['next-themes'],
          'toast': ['sonner'],
          'idb': ['idb-keyval']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        pure_funcs: ['console.log'],
        ecma: 2020,
        comparisons: false,
        inline: 2,
        reduce_funcs: true,
        reduce_vars: true,
        unused: true
      },
      mangle: {
        safari10: true
      }
    },
    chunkSizeWarningLimit: 150,
    reportCompressedSize: true,
    cssCodeSplit: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-router']
  }
});
