// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxt/fonts'
  ],

  css: ['~/assets/css/main.css'],

  fonts: {
    families: [
      { name: 'Inter', provider: 'google', weights: [400, 500, 600, 700] }
    ]
  }
})