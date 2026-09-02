import type { Trip } from '~/types/domain'

/**
 * pete-pete handoff. jalan keeps its own budget-facing expense log; the actual
 * bill-splitting / settle-up happens in pete-pete's mature UI. This creates a
 * bill (via jalan's server proxy) seeded with the trip's members, remembers its
 * id on the trip, and opens it. Inert unless `petePeteUrl` is configured.
 */
export function usePetePete() {
  const config = useRuntimeConfig()
  const base = computed(() => (config.public.petePeteUrl as string || '').replace(/\/+$/, ''))
  const enabled = computed(() => !!base.value)
  const busy = ref(false)

  function billUrl(id: string) {
    return `${base.value}/bill/${id}`
  }

  async function createSplit(trip: Trip): Promise<string | null> {
    if (!enabled.value || busy.value) return null
    busy.value = true
    try {
      const res = await $fetch<{ id: string; url: string }>('/api/pete-pete/create', {
        method: 'POST',
        body: { title: trip.name, participants: trip.members.map((m) => ({ name: m.name })) },
      })
      return res.id
    } finally {
      busy.value = false
    }
  }

  return { enabled, busy, billUrl, createSplit }
}
