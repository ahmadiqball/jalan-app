import type { Destination, Place } from '~/types/guide'

interface SavedData {
  guideIds: string[]
  placeIds: string[]
  guides: Destination[]
  places: (Place & { destinationSlug?: string })[]
}

/** Per-user bookmarks ("Simpan"). Shared reactive state across the app. */
export function useSaved() {
  const { apiFetch } = useApi()
  const session = useSessionStore()
  const data = useState<SavedData>('saved-data', () => ({ guideIds: [], placeIds: [], guides: [], places: [] }))
  const loaded = useState('saved-loaded', () => false)

  async function refresh() {
    if (!session.authed) return
    try { data.value = await apiFetch<SavedData>('/api/saved'); loaded.value = true } catch { /* ignore */ }
  }
  function isSaved(kind: 'guide' | 'place', id: string): boolean {
    return (kind === 'guide' ? data.value.guideIds : data.value.placeIds).includes(id)
  }
  async function toggle(kind: 'guide' | 'place', id: string): Promise<boolean> {
    const key = kind === 'guide' ? 'guideIds' : 'placeIds'
    const was = isSaved(kind, id)
    data.value[key] = was ? data.value[key].filter((x) => x !== id) : [...data.value[key], id] // optimistic
    try {
      await apiFetch('/api/saved', { method: was ? 'DELETE' : 'POST', body: { kind, refId: id } })
      await refresh()
    } catch {
      data.value[key] = was ? [...data.value[key], id] : data.value[key].filter((x) => x !== id) // revert
    }
    return !was
  }
  return { data, loaded, refresh, isSaved, toggle }
}
