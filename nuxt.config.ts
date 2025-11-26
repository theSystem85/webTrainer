// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Static generation for Netlify
  ssr: true,
  nitro: {
    preset: 'static',
    prerender: {
      routes: ['/']
    }
  },

  modules: [
    '@nuxt/content',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/fonts',
    '@vite-pwa/nuxt'
  ],

  // PWA Configuration
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Skill Trainer',
      short_name: 'SkillTrainer',
      description: 'Track and improve your coding skills with confidence assessments and AI-powered quizzes',
      theme_color: '#09090b',
      background_color: '#09090b',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/pwa-192x192.svg',
          sizes: '192x192',
          type: 'image/svg+xml'
        },
        {
          src: '/pwa-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml'
        },
        {
          src: '/pwa-512x512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }
      ]
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: false,
      type: 'module'
    }
  },

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] }
    ]
  },

  // App configuration
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }
      ]
    }
  }
})