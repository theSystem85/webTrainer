<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
useHead({
  title: 'Skill Trainer',
  meta: [
    { name: 'description', content: 'Track and improve your coding skills with confidence assessments and AI-powered quizzes' },
    { name: 'theme-color', content: '#09090b' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Skill Trainer' },
    { name: 'application-name', content: 'Skill Trainer' },
    { name: 'msapplication-TileColor', content: '#09090b' }
  ],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.svg' }
  ],
  htmlAttrs: {
    class: 'dark',
    lang: 'en'
  }
})
</script>