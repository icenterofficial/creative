import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Ponloe Creative',
        short_name: 'Ponloe',
        description: 'Leading creative agency in Phnom Penh offering Web Development, Mobile Apps, Architecture, and Graphic Design.',
        theme_color: '#030712',
        background_color: '#030712',
        display: 'standalone',
        icons: [
          {
            src: '/ponloe-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: '/ponloe-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
