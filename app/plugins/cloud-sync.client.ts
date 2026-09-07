import type { Trip } from '~/types/domain'

/**
 * Cloud sync (client-only). No-op in local mode. In cloud mode:
 *  - restores the Supabase session and pulls the user's trips on sign-in
 *  - mirrors local trip changes to the server (debounced diff: PUT changed,
 *    DELETE removed), with an offline queue flushed on reconnect
 * A snapshot + `applyingRemote` guard prevents pull→watch→push loops.
 */
export default defineNuxtPlugin(() => {
  if (!useIsCloud()) return
  const client = useSupabaseClient()
  if (!client) return

  const session = useSessionStore()
  const trips = useTripsStore()
  const { apiFetch } = useApi()

  const snapshot = new Map<string, string>() // id -> JSON of last-synced trip
  const pushQueue = new Set<string>()
  const delQueue = new Set<string>()
  let applyingRemote = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let loaded = false

  const json = (t: Trip) => JSON.stringify(t)

  async function pull() {
    try {
      const rows = await apiFetch<Trip[]>('/api/trips')
      applyingRemote = true
      trips.replaceAll(rows)
      await nextTick()
      snapshot.clear()
      // snapshot only real user trips — templates are not synced as trips
      for (const t of trips.userTrips) snapshot.set(t.id, json(t))
      loaded = true
    } catch {
      // offline / not reachable — keep local cache, try again later
    } finally {
      applyingRemote = false
    }
  }

  async function flush() {
    if (!session.authed || (!pushQueue.size && !delQueue.size)) return
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return

    for (const id of [...pushQueue]) {
      const t = trips.byId(id)
      if (!t) { pushQueue.delete(id); continue }
      try {
        await apiFetch(`/api/trips/${id}`, { method: 'PUT', body: t })
        snapshot.set(id, json(t))
        pushQueue.delete(id)
      } catch { /* keep queued */ }
    }
    for (const id of [...delQueue]) {
      try {
        await apiFetch(`/api/trips/${id}`, { method: 'DELETE' })
        snapshot.delete(id)
        delQueue.delete(id)
      } catch { /* keep queued */ }
    }
  }

  function schedule() {
    if (!session.authed || session.guest || !loaded) return
    const ids = new Set(trips.userTrips.map((t) => t.id))
    for (const t of trips.userTrips) {
      // templates live in global content, never as user trips; skip them.
      // only push trips this user may edit — a viewer's local edits stay local
      if (snapshot.get(t.id) !== json(t) && tripRole(t, session.email, true) !== 'viewer') pushQueue.add(t.id)
    }
    for (const id of snapshot.keys()) {
      if (!ids.has(id)) delQueue.add(id)
    }
    clearTimeout(timer)
    timer = setTimeout(flush, 700)
  }

  watch(
    () => trips.trips,
    () => { if (!applyingRemote) schedule() },
    { deep: true },
  )

  const isAdmin = useState<boolean>('me-admin', () => false)
  async function refreshMe() {
    try {
      const me = await apiFetch<{ isAdmin: boolean }>('/api/me')
      isAdmin.value = me.isAdmin
    } catch {
      isAdmin.value = false
    }
  }

  const router = useRouter()

  client.auth.onAuthStateChange((eventName, s) => {
    if (s?.user) {
      session.setUser({
        id: s.user.id,
        email: s.user.email || undefined,
        name: (s.user.user_metadata?.name as string) || s.user.email?.split('@')[0] || 'Kamu',
      })
      if (eventName === 'SIGNED_IN' || eventName === 'INITIAL_SESSION') {
        pull()
        refreshMe()
      }
      // Auth resolves asynchronously (e.g. after the OAuth redirect lands on a
      // page). If we're still on the login screen once signed in, forward on —
      // the route middleware only runs on navigation, so it can't do this.
      const cur = router.currentRoute.value
      if (cur.path === '/masuk') {
        const q = cur.query.next
        navigateTo(typeof q === 'string' && q.startsWith('/') ? q : '/beranda')
      }
    } else if (eventName === 'SIGNED_OUT') {
      session.signOut()
      isAdmin.value = false
      applyingRemote = true
      trips.replaceAll([])
      snapshot.clear()
      loaded = false
      applyingRemote = false
    }
  })

  if (typeof window !== 'undefined') window.addEventListener('online', flush)
})
