import type { NuxtApp } from '#app'

/**
 * getCachedData helper for useFetch/useAsyncData: reuse Nuxt's payload/static
 * cache so client-side navigation serves instantly instead of refetching.
 * (Public, read-only content; a full reload still fetches fresh data.)
 */
export function payloadCache<T = unknown>(key: string, nuxtApp: NuxtApp): T | undefined {
  return (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) as T | undefined
}
