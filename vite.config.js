import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/espanol-snap/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Español Snap — Spanish Picture Quiz',
        short_name: 'Español Snap',
        description: 'Learn Spanish vocabulary with a quick offline picture quiz.',
        lang: 'en',
        theme_color: '#0f766e',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/espanol-snap/',
        scope: '/espanol-snap/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // Precache the app shell + bundled photos so it works fully offline.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,json,woff2}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
      },
      devOptions: {
        enabled: false
      }
    })
  ]
})
