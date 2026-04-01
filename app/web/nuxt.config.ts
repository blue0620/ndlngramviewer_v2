import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  css: ['~/src/styles/main.scss'],
  routeRules: {
    '/ngramviewer': { redirect: { to: '/ngramviewer/', statusCode: 308 } },
  },
  compatibilityDate: '2026-04-01',
})