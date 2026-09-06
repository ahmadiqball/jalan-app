/**
 * Invite links. Reuses the trip's public share slug as the invite token; the
 * granted role lives on the trip (owner-controlled), so a link can't be
 * escalated via the URL. Cloud-only: needs the trip persisted server-side.
 */
export function useInvite() {
  const { apiFetch } = useApi()
  const cloud = computed(() => useIsCloud())
  const busy = ref(false)

  /** ensure the trip has a share slug and return it (idempotent) */
  async function ensureLink(tripId: string): Promise<string> {
    busy.value = true
    try {
      const { shareId } = await apiFetch<{ shareId: string }>(`/api/trips/${tripId}/share`, { method: 'POST' })
      return shareId
    } finally {
      busy.value = false
    }
  }

  function joinUrl(shareId: string): string {
    const origin = import.meta.client ? window.location.origin : ''
    return `${origin}/join/${shareId}`
  }

  function waUrl(link: string, tripName: string): string {
    const text = `Yuk ikut rencana trip "${tripName}" di Jalan: ${link}`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }

  return { cloud, busy, ensureLink, joinUrl, waUrl }
}
