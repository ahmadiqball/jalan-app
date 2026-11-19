import type { Trip } from '~/types/domain'

/**
 * Public Rute Kelana routes, fetched from the templates table (SSR-friendly).
 *
 * No `default` on purpose: during hydration Nuxt treats any non-null data as
 * "already filled from the server payload" and skips the request. With
 * `default: () => []`, a component inside <ClientOnly> (the home page's
 * "Mulai dari Rute Kelana") never fetched on a full reload and stayed empty.
 * `templates` below already falls back to [].
 */
export function useTemplatesList() {
  const { data, refresh } = useFetch<Trip[]>('/api/templates', {
    key: 'templates-list',
    getCachedData: payloadCache,
  })
  const templates = computed(() => data.value ?? [])
  return { templates, refresh }
}
