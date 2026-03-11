import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['f1-logo.svg'],
      manifest: {
        name: 'F1 2026 Season Tracker',
        short_name: 'F1 Tracker',
        description: 'Track the 2026 Formula 1 season — live standings, race calendar, predictions and stats',
        theme_color: '#0F0F13',
        background_color: '#0F0F13',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:.*\/api\/v1\/(drivers|constructors|races|predictions|stats)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'f1-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        onError: (err) => { /* suppress proxy errors on WS reconnect */ },
      },
    },
  },
});
