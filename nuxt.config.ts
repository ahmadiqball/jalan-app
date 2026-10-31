// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SSR on: shell renders on the server; the persisted trip store hydrates
  // client-side (localStorage has no server equivalent). Real server data fetch
  // is a later, clean addition.
  ssr: true,

  // Cache public, read-only content on the server/CDN (swr: serve fast, revalidate
  // in the background). User- and admin-specific routes are never cached.
  routeRules: {
    '/api/guides': { cache: { maxAge: 120, swr: true } },
    '/api/guides/**': { cache: { maxAge: 120, swr: true } },
    '/api/places/**': { cache: { maxAge: 120, swr: true } },
    '/api/templates': { cache: { maxAge: 120, swr: true } },
  },

  modules: [
    '@unocss/nuxt',
    '@nuxt/fonts',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'reka-ui/nuxt',
    '@nuxtjs/i18n',
  ],

  // Indonesian at the root (default, no prefix); English under /en.
  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'id',
    locales: [
      { code: 'id', name: 'Indonesia', language: 'id-ID', file: 'id.json' },
      { code: 'en', name: 'English', language: 'en-US', file: 'en.json' },
    ],
    detectBrowserLanguage: false,
    bundle: { optimizeTranslationDirective: false },
  },

  css: [
    '@unocss/reset/tailwind.css',
    '~/designs/tokens.css',
    '~/designs/base.css',
  ],

  runtimeConfig: {
    // server-only (service role). Required, in dev too.
    supabaseUrl: '', // NUXT_SUPABASE_URL
    supabaseServiceKey: '', // NUXT_SUPABASE_SERVICE_KEY (secret, never client)
    adminEmails: '', // NUXT_ADMIN_EMAILS — comma-separated admin emails
    midtransServerKey: '', // NUXT_MIDTRANS_SERVER_KEY (secret, never client)
    midtransProduction: false, // NUXT_MIDTRANS_PRODUCTION — true for live payments
    public: {
      // pete-pete handoff base URL. Empty => the "Bagi rata di PetePete" action
      // is hidden. Override with NUXT_PUBLIC_PETE_PETE_URL.
      // canonical host — the apex 308-redirects to www
      petePeteUrl: 'https://www.petepete.in',
      // client auth. Required, in dev too.
      supabaseUrl: '', // NUXT_PUBLIC_SUPABASE_URL
      supabaseAnonKey: '', // NUXT_PUBLIC_SUPABASE_ANON_KEY
      // Google Maps Embed API key. Empty => embeds fall back to free "open in
      // Maps" deep links (no key, no cost). The Embed API itself is free.
      googleMapsKey: '', // NUXT_PUBLIC_GOOGLE_MAPS_KEY
    },
  },

  fonts: {
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700, 800] },
      { name: 'Fraunces', provider: 'google', weights: [400, 500, 600] },
      { name: 'IBM Plex Mono', provider: 'google', weights: [400, 500, 600] },
    ],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Kelana',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Rencana jalan, anggaran, dan barang di satu tempat.' },
        { name: 'theme-color', content: '#0E6E76' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
      ],
    },
  },
})
