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
        { name: 'theme-color', content: '#0E6E76' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href:
            "data:image/svg+xml," +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="9" fill="#0E6E76"/><circle cx="11" cy="12" r="3.5" fill="#F1EEE1"/><path d="M2 24c0-5 4-8 8-8s8 3 8 8z" fill="#2F6B54"/><rect x="10" y="24" width="20" height="4" rx="2" fill="#F0713A"/></svg>',
            ),
        },
      ],
    },
  },
})
