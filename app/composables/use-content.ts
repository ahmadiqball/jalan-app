import type { ContentDoc } from '~/types/content'

/** App content (templates + packing recs), fetched from the server (SSR-friendly). */
export function useContent() {
  const { data, refresh } = useFetch<ContentDoc>('/api/content', {
    key: 'app-content',
    default: () => ({ templates: [], recs: [] }),
  })
  const templates = computed(() => data.value?.templates ?? [])
  const recs = computed(() => data.value?.recs ?? [])
  const regions = computed(() => data.value?.regions ?? [])
  const places = computed(() => data.value?.places ?? [])

  async function save(doc: ContentDoc): Promise<void> {
    const { apiFetch } = useApi()
    const res = await apiFetch<ContentDoc>('/api/content', { method: 'PUT', body: doc })
    data.value = res
  }

  return { templates, recs, regions, places, content: data, refresh, save }
}
