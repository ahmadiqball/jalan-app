import type { Trip } from '~/types/domain'

/** Public starter templates, fetched from the templates table (SSR-friendly). */
export function useTemplatesList() {
  const { data, refresh } = useFetch<Trip[]>('/api/templates', {
    key: 'templates-list',
    default: () => [],
  })
  const templates = computed(() => data.value ?? [])
  return { templates, refresh }
}
