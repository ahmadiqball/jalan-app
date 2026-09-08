import type { Trip } from '~/types/domain'

/**
 * pete-pete handoff. jalan keeps its own budget-facing expense log; the actual
 * bill-splitting / settle-up happens in pete-pete's mature UI. jalan mirrors the
 * trip's recorded spending into a pete-pete bill and remembers the bill id plus
 * a jalan-line -> pete-entry map on the trip, so re-syncs reconcile in place.
 * Inert unless `petePeteUrl` is configured.
 */
export interface KeyedEntry { key: string; title: string; amount: number; payer?: string; sharers?: string[] }

export function usePetePete() {
  const config = useRuntimeConfig()
  const base = computed(() => (config.public.petePeteUrl as string || '').replace(/\/+$/, ''))
  const enabled = computed(() => !!base.value)
  const busy = ref(false)

  function billUrl(id: string) {
    return `${base.value}/bill/${id}`
  }

  /** Recorded spending → keyed pete-pete entries. Paid activity costs split
   *  among the activity's participants; manual expenses split across everyone.
   *  Each entry is keyed by its jalan line id for stable reconciliation. Payer
   *  defaults to the trip owner (adjust in pete-pete — jalan doesn't track it). */
  function buildEntries(trip: Trip): KeyedEntry[] {
    const members = trip.members
    const owner = members.find((m) => m.role === 'Pemilik') || members[0]
    const nameById = (id: string) => members.find((m) => m.id === id)?.name
    const allNames = members.map((m) => m.name)
    const out: KeyedEntry[] = []

    trip.days.forEach((d) =>
      d.acts.forEach((a) => {
        if (a.cost > 0 && a.paid) {
          const sharers = (a.participants?.length ? a.participants : members.map((m) => m.id))
            .map(nameById)
            .filter((n): n is string => !!n)
          out.push({ key: a.id, title: a.title || a.cat, amount: a.cost, payer: owner?.name, sharers: sharers.length ? sharers : allNames })
        }
      }),
    )
    ;(trip.manual || []).forEach((m) =>
      out.push({ key: m.id, title: m.title || m.cat, amount: m.amount, payer: owner?.name, sharers: allNames }),
    )
    return out
  }

  /** Stable signature of what would be pushed — lets callers skip no-op syncs. */
  function entriesSig(trip: Trip): string {
    return JSON.stringify({ p: trip.members.map((m) => m.name), e: buildEntries(trip) })
  }

  /** Create (no billId) or reconcile (billId) the pete-pete bill for a trip.
   *  Returns the bill id and the refreshed jalan-line -> entry-id map. */
  async function sync(trip: Trip): Promise<{ id: string; map: Record<string, string> } | null> {
    if (!enabled.value) return null
    busy.value = true
    try {
      const res = await $fetch<{ id: string; url: string; map: Record<string, string> }>('/api/pete-pete/sync', {
        method: 'POST',
        body: {
          billId: trip.splitBillId || undefined,
          title: trip.name,
          participants: trip.members.map((m) => ({ name: m.name })),
          entries: buildEntries(trip),
          map: trip.splitMap || {},
        },
      })
      return { id: res.id, map: res.map || {} }
    } finally {
      busy.value = false
    }
  }

  return { enabled, busy, billUrl, buildEntries, entriesSig, sync }
}
