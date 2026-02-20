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
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        categories: ['business', 'productivity'],
        screenshots: [
          {
            src: '/ponloe-logo.svg',
            sizes: '540x720',
            type: 'image/svg+xml',
            form_factor: 'narrow'
          },
          {
            src: '/ponloe-logo.svg',
            sizes: '1280x720',
            type: 'image/svg+xml',
            form_factor: 'wide'
          }
        ],
        icons: [
          {
            src: '/ponloe-logo.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot}'],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
})
