import type { Trip } from '~/types/domain'

/** Every Rute Kelana route incl. drafts (admin-only endpoint), shared across admin pages. */
export function useAdminTemplatesList() {
  const { apiFetch } = useApi()
  const all = useState<Trip[]>('admin-templates', () => [])
  const loaded = useState('admin-templates-loaded', () => false)
  async function refresh() {
    all.value = await apiFetch<Trip[]>('/api/admin/templates')
    loaded.value = true
  }
  if (import.meta.client && !loaded.value) refresh().catch(() => {})
  return { templates: all, loaded, refresh }
}

/**
 * Admin routes (Rute Kelana). A route is a full trip document stored one row
 * per route in the templates table. For editing we load them into the trips
 * store so the normal trip tabs can edit them, then persist each edited route
 * back to its own row. `published` decides whether users can see it.
 */
export function useTemplates() {
  const trips = useTripsStore()
  const { apiFetch } = useApi()
  const { templates, refresh } = useAdminTemplatesList()
  const { refresh: refreshPublic } = useTemplatesList()

  /** load routes into the store (idempotent; only when store empty), and keep
   *  each route's draft/live flag in sync with the server */
  function ensureLoaded() {
    if (!templates.value.length) return
    if (trips.templateTrips.length === 0) {
      trips.loadTemplates(templates.value)
      return
    }
    for (const t of templates.value) {
      const local = trips.byId(t.id)
      if (local && local.published === undefined && t.published !== undefined) trips.updateTrip(t.id, { published: t.published })
    }
  }

  const list = computed(() => trips.templateTrips)

  /** persist one edited route (by id) to its row */
  async function persist(id: string) {
    const t = trips.byId(id)
    if (!t) return
    await apiFetch(`/api/admin/templates/${id}`, { method: 'PUT', body: t })
    await Promise.all([refresh(), refreshPublic()])
  }
  /** flip draft/live and save in one go */
  async function setPublished(id: string, published: boolean) {
    const before = trips.byId(id)?.published
    trips.updateTrip(id, { published })
    try {
      await persist(id)
    } catch (e) {
      trips.updateTrip(id, { published: before })
      throw e
    }
  }
  async function create(): Promise<string> {
    const id = trips.addTemplate()
    await persist(id)
    return id
  }
  async function remove(id: string) {
    await apiFetch(`/api/admin/templates/${id}`, { method: 'DELETE' })
    trips.deleteTemplate(id)
    await Promise.all([refresh(), refreshPublic()])
  }

  return { list, templates, ensureLoaded, persist, setPublished, create, remove }
}
