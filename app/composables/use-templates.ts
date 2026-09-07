import type { Trip } from '~/types/domain'
import type { PackRecItem } from '~/types/content'

/**
 * Admin templates. A template is a full trip document stored in global content.
 * We load them into the trips store so the normal trip tabs can edit them, then
 * persist the edited template trips back to content.
 */
export function useTemplates() {
  const trips = useTripsStore()
  const { content, templates: contentTemplates, save } = useContent()

  /** load content templates into the store (idempotent; only when store empty) */
  function ensureLoaded() {
    if (trips.templateTrips.length === 0 && contentTemplates.value.length) {
      trips.loadTemplates(contentTemplates.value as Trip[])
    }
  }

  const list = computed(() => trips.templateTrips)

  async function persist() {
    const recs = (content.value?.recs ?? []) as PackRecItem[]
    await save({ templates: trips.templateTrips as Trip[], recs })
  }
  function create(): string {
    return trips.addTemplate()
  }
  function remove(id: string) {
    trips.deleteTemplate(id)
  }

  return { list, ensureLoaded, persist, create, remove }
}
