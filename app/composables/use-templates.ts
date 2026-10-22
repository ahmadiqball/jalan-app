import type { Trip } from '~/types/domain'

/**
 * Admin templates. A template is a full trip document, now stored one row per
 * template in the templates table. For editing we still load them into the
 * trips store so the normal trip tabs can edit them, then persist each edited
 * template back to its own row (not a single blob).
 */
export function useTemplates() {
  const trips = useTripsStore()
  const { apiFetch } = useApi()
  const { templates, refresh } = useTemplatesList()

  /** load templates into the store (idempotent; only when store empty) */
  function ensureLoaded() {
    if (trips.templateTrips.length === 0 && templates.value.length) {
      trips.loadTemplates(templates.value as Trip[])
    }
  }

  const list = computed(() => trips.templateTrips)

  /** persist one edited template (by id) to its row */
  async function persist(id: string) {
    const t = trips.byId(id)
    if (!t) return
    await apiFetch(`/api/admin/templates/${id}`, { method: 'PUT', body: t })
    await refresh()
  }
  async function create(): Promise<string> {
    const id = trips.addTemplate()
    await persist(id)
    return id
  }
  async function remove(id: string) {
    await apiFetch(`/api/admin/templates/${id}`, { method: 'DELETE' })
    trips.deleteTemplate(id)
    await refresh()
  }

  return { list, templates, ensureLoaded, persist, create, remove }
}
