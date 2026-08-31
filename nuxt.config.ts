// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SSR on: shell renders on the server; the persisted trip store hydrates
  // client-side (localStorage has no server equivalent). Real server data fetch
  // is a later, clean addition.
  ssr: true,

  modules: [
    '@unocss/nuxt',
    '@nuxt/fonts',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'reka-ui/nuxt',
  ],

  css: [
    '@unocss/reset/tailwind.css',
    '~/designs/tokens.css',
    '~/designs/base.css',
  ],

  fonts: {
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Fraunces', provider: 'google', weights: [400, 500, 600] },
      { name: 'IBM Plex Mono', provider: 'google', weights: [400, 500, 600] },
    ],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Jalan',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Rencana jalan, anggaran, dan barang di satu tempat.' },
      ],
    },
  },
})
