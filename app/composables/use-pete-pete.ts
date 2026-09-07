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

  /** Recorded spending → pete-pete entries. Paid activity costs split among the
   *  activity's participants; manual expenses split across everyone. Payer
   *  defaults to the trip owner (adjust in pete-pete — jalan doesn't track it). */
  function buildEntries(trip: Trip) {
    const members = trip.members
    const owner = members.find((m) => m.role === 'Pemilik') || members[0]
    const nameById = (id: string) => members.find((m) => m.id === id)?.name
    const allNames = members.map((m) => m.name)
    const entries: { title: string; amount: number; payer?: string; sharers?: string[] }[] = []

    trip.days.forEach((d) =>
      d.acts.forEach((a) => {
        if (a.cost > 0 && a.paid) {
          const sharers = (a.participants?.length ? a.participants : members.map((m) => m.id))
            .map(nameById)
            .filter((n): n is string => !!n)
          entries.push({ title: a.title || a.cat, amount: a.cost, payer: owner?.name, sharers: sharers.length ? sharers : allNames })
        }
      }),
    )
    ;(trip.manual || []).forEach((m) =>
      entries.push({ title: m.title || m.cat, amount: m.amount, payer: owner?.name, sharers: allNames }),
    )
    return entries
  }

  async function createSplit(trip: Trip): Promise<string | null> {
    if (!enabled.value || busy.value) return null
    busy.value = true
    try {
      const res = await $fetch<{ id: string; url: string }>('/api/pete-pete/create', {
        method: 'POST',
        body: {
          title: trip.name,
          participants: trip.members.map((m) => ({ name: m.name })),
          entries: buildEntries(trip),
        },
      })
      return res.id
    } finally {
      busy.value = false
    }
  }

  return { enabled, busy, billUrl, createSplit }
}
