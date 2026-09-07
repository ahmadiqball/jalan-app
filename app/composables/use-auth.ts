/**
 * Auth facade. Cloud mode → Supabase Auth; local mode → the offline stub.
 * UI (login) calls these without knowing which mode is active.
 */
import { setGuestPersist } from '~/utils/persist'

export function useAuth() {
  const session = useSessionStore()
  const trips = useTripsStore()
  const client = useSupabaseClient()
  const cloud = computed(() => useIsCloud())

  type Result = { ok: boolean; error?: string; needConfirm?: boolean }

  function applyUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }) {
    session.setUser({
      id: u.id,
      email: u.email || undefined,
      name: (u.user_metadata?.name as string) || u.email?.split('@')[0] || 'Kamu',
    })
  }

  async function signIn(email: string, pw: string): Promise<Result> {
    if (!cloud.value || !client) {
      session.signIn({ email })
      return { ok: true }
    }
    const { data, error } = await client.auth.signInWithPassword({ email, password: pw })
    if (error) return { ok: false, error: error.message }
    if (data.user) applyUser(data.user)
    return { ok: true }
  }

  async function signUp(email: string, pw: string, name: string): Promise<Result> {
    if (!cloud.value || !client) {
      session.signIn({ email, name })
      return { ok: true }
    }
    const { data, error } = await client.auth.signUp({ email, password: pw, options: { data: { name } } })
    if (error) return { ok: false, error: error.message }
    if (data.user && data.session) applyUser(data.user)
    return { ok: true, needConfirm: !data.session }
  }

  async function signOut() {
    if (cloud.value && client) await client.auth.signOut()
    setGuestPersist(false)
    session.signOut()
  }

  async function signInGoogle(next = '/beranda'): Promise<Result> {
    if (!cloud.value || !client) return { ok: false, error: 'Google hanya di mode cloud' }
    // Return to the public /masuk page (not a guarded route) so the auth
    // middleware can't bounce us before Supabase hydrates the session; /masuk
    // forwards onward once `authed` flips. `next` is preserved when set.
    const base = `${window.location.origin}/masuk`
    const redirectTo = next && next !== '/beranda' ? `${base}?next=${encodeURIComponent(next)}` : base
    const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    if (error) return { ok: false, error: error.message }
    return { ok: true } // browser redirects to Google; session resolves on return
  }

  /** Guest trial: fresh demo data, local + ephemeral, never synced to cloud. */
  function guest() {
    setGuestPersist(true) // stop persisting — guest edits stay in memory only
    trips.resetSeed() // start the trial from clean demo data
    session.signInGuest()
  }

  return { cloud, signIn, signUp, signInGoogle, signOut, guest }
}
